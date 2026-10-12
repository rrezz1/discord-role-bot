const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const { exclusiveRoles, buttonStyle } = require("./roles");

function buildPanel(panel) {
  const roles = exclusiveRoles(panel);
  if (roles.length === 0) {
    throw new Error("Shto ID-të e roleve në config.json para se të postosh panelin.");
  }
  if (roles.length > 25) {
    throw new Error("Discord lejon maksimum 25 butona. Hiq disa role nga config.json.");
  }

  const embed = new EmbedBuilder()
    .setTitle(panel.title)
    .setDescription(panel.description)
    .setColor(0x5865f2);

  const rows = [];
  for (let i = 0; i < roles.length; i += 5) {
    const chunk = roles.slice(i, i + 5);
    const row = new ActionRowBuilder();
    for (const role of chunk) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`role:${role.id}`)
          .setLabel(role.label.slice(0, 80))
          .setStyle(ButtonStyle[buttonStyle(role.style)])
      );
    }
    rows.push(row);
  }

  return { embeds: [embed], components: rows };
}

module.exports = { buildPanel };
