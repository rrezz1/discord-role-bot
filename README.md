# Discord Role Bot

Bot që i jep përdoruesit një rol me butona në një kanal. Kur zgjedh një rol, të tjerat nga lista hiqen automatikisht.

## Setup në Discord

1. Shko te [Discord Developer Portal](https://discord.com/developers/applications) dhe krijo një Application.
2. Në **Bot**, krijo botin dhe kopjo token-in.
3. Në **OAuth2 → URL Generator**, zgjidh `bot` dhe `applications.commands`.
4. Te Bot Permissions zgjidh: `Manage Roles`, `Send Messages`, `Embed Links`, `Use Slash Commands`.
5. Fto botin në server me URL-në e gjeneruar.
6. Në Discord: Settings → Roles. Vendos rolin e botit **më lart** se rolet që do t’i japë përdoruesve.

## Setup lokal

```bash
cp .env.example .env
```

Plotëso `.env`:

- `DISCORD_TOKEN` — token i botit
- `CLIENT_ID` — Application ID
- `GUILD_ID` — ID e serverit (Developer Mode → right click server → Copy Server ID)

Në `config.json`:

- `channelId` — kanali ku do të jetë paneli (opsionale, por e rekomanduar)
- `exclusiveRoles` — për çdo rol: `id` (Copy Role ID), `label` (teksti i butonit), `style` (`Primary`, `Secondary`, `Success`, `Danger`)

```bash
npm install
npm start
```

Në kanalin e caktuar shkruaj `/setup-roles` (duhet leja Manage Roles). Paneli me butona mbetet aty; përdoruesit shtypin një buton për të marrë rolin.

Shtypja e të njëjtit buton përsëri e heq rolin.
# discord-role-bot
# discord-role-bot
# discord-role-bot
