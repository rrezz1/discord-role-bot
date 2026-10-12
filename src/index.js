require("dotenv").config();

const {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const { findPanelByChannel, exclusiveRoles, findGroupByRoleId } = require("./roles");
const { buildPanel } = require("./panel");

if (!process.env.DISCORD_TOKEN) {
  console.error("Mungon DISCORD_TOKEN në .env");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = [
  new SlashCommandBuilder()
    .setName("setup-roles")
    .setDescription("Poston panelin e butonave për këtë kanal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .toJSON(),
];

async function registerCommands() {
  const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;
  if (!CLIENT_ID || !GUILD_ID) {
    console.warn("CLIENT_ID ose GUILD_ID mungon. Komanda /setup-roles nuk u regjistrua.");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: commands,
  });
  console.log("Komanda /setup-roles u regjistrua.");
}

async function applyExclusiveRole(member, groupRoleIds, selectedRoleId) {
  const alreadyHasSelected = member.roles.cache.has(selectedRoleId);
  const toRemove = groupRoleIds.filter((id) => id !== selectedRoleId && member.roles.cache.has(id));

  if (toRemove.length > 0) {
    await member.roles.remove(toRemove);
  }

  if (alreadyHasSelected) {
    await member.roles.remove(selectedRoleId);
    return "removed";
  }

  await member.roles.add(selectedRoleId);
  return "added";
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Kyçur si ${readyClient.user.tag}`);
  try {
    await registerCommands();
  } catch (error) {
    console.error("Regjistrimi i komandave dështoi:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (process.env.GUILD_ID && interaction.guildId && interaction.guildId !== process.env.GUILD_ID) {
      return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === "setup-roles") {
      const panel = findPanelByChannel(interaction.channelId);
      if (!panel) {
        await interaction.reply({
          content: "Ky kanal nuk ka panel. Shko te kanali i gjeneratës ose i specializimit dhe përdor /setup-roles aty.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      try {
        await interaction.reply(buildPanel(panel));
      } catch (error) {
        if (error.code === 50001) {
          await interaction.reply({
            content:
              "Boti s'ka leje në këtë kanal. Te Edit Channel → Permissions, shto **role manager** dhe jepi View Channel, Send Messages, Embed Links.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        throw error;
      }
      return;
    }

    if (!interaction.isButton() || !interaction.customId.startsWith("role:")) {
      return;
    }

    const roleId = interaction.customId.slice("role:".length);
    const group = findGroupByRoleId(roleId);
    if (!group) {
      await interaction.reply({
        content: "Ky rol nuk është më në listën e botit.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: "Ky buton funksionon vetëm në server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      await interaction.reply({
        content: `Roli \`${group.role.label}\` nuk u gjet në server. Kontrollo ID-në në config.json.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const me = guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageRoles) || role.position >= me.roles.highest.position) {
      await interaction.reply({
        content: "Boti nuk mund ta japë këtë rol. Vendose rolin e botit më lart se rolet që jep, dhe jepi lejen Manage Roles.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id);
    const groupIds = exclusiveRoles(group.panel).map((item) => item.id);
    const result = await applyExclusiveRole(member, groupIds, roleId);

    if (result === "added") {
      await interaction.reply({
        content: `Morrët **${role.name}**. Rolet e tjera të këtij paneli u hoqën. Roli nga paneli tjetër mbetet.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: `Roli **${role.name}** u hoq.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    console.error(error);
    const missingAccess = error.code === 50001;
    const message = missingAccess
      ? "Boti s'ka leje në këtë kanal. Te Edit Channel → Permissions, shto **role manager** dhe jepi View Channel, Send Messages, Embed Links."
      : `Gabim: ${error.message || "kontrollo lejet e botit dhe ID-të e roleve."}`;
    const payload = { content: message, flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
