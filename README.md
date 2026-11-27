# Yami 🌙

A Discord bot for our server, written in Python with [discord.py](https://discordpy.readthedocs.io/).
It's a pastime project, so the features are a bit all over the place. :)

![](yami_image.png)

## ✨ Features

### Commands

| Command | What it does |
|---|---|
| `!help` | Lists the general commands |
| `!play <youtube link>` | Joins your voice channel and plays the audio |
| `!stop` | Stops playback and leaves the channel |
| `!youtubesearch <query>` | Replies with the first matching video |
| `!uptime` | How long Yami has been running |
| `!giverole <role>` | Gives you a role, if it's not above your highest one |
| `!dndposts` | DnDBeyond posts from the last 7 days |

### 🎮 WhoWroteIt

`!wwi <name> <name> ...` starts a game in the current channel. Yami picks an old message (more than 5 words, no links)
from one of the players and everyone guesses who wrote it by typing a name. The first correct guess wins.
`!wwi abort` stops a running game.

### 📝 Custom commands

| Command | What it does |
|---|---|
| `!addcustom <name> <text>` | Creates `!<name>`, which replies with the text |
| `!deletecustom <name>` | Deletes it again |
| `!showcustom` | Lists all custom commands |

### 🐉 Monster Hunter World

| Command | What it does |
|---|---|
| `!mhhelp` | Lists the Monster Hunter commands and parameters |
| `!weaponstrength <sharpness> <attack> <affinity> <element> <weapon>` | Average damage per hit against a generic target |
| `!weaponcompare <4 values weapon 1> <4 values weapon 2> <weapon>` | Which weapon is better, and by how much |
| `!motionvalues <weapon>` | Motion values for every attack of a weapon type |
| `!kiranico [category] [object]` | Link to [Kiranico](https://mhworld.kiranico.com) |
| `!armorsets` | Link to the armor set spreadsheet |

### In the background

- 🔊 Announces when someone joins, leaves or switches a voice channel
- 📜 Checks DnDBeyond every 12 hours and posts new articles
- 🩺 Health endpoint on `:8080/actuator/health`

## 🛠️ Development

You need Python 3.14, [uv](https://docs.astral.sh/uv/), ffmpeg (for voice) and make.

```bash
uv sync
uv run src/bot.py # run the bot
uv run pytest     # pytest
```

The bot needs two config files in `resources/`. `api_config.json` holds the secrets and is gitignored:

```json
{
  "token": "your discord bot token",
  "youtubeClient": "your google api key"
}
```

`config.json` holds the server setup:

```json
{
  "defaultGuildName": "name",
  "defaultGuildId": "id",
  "defaultChannelId": "id for announcements",
  "defaultVoiceChannelId": "id",
  "defaultImageChannelId": "id",
  "playMessage": "status text",
  "commandPrefix": "!",
  "startMessage": "message posted on startup",
  "customCommandsPath": "/tmp/yami/commands/custom.json",
  "logFilePath": "/tmp/yami/logs/log.txt"
}
```

In the Discord developer portal, enable the **Message Content** and **Server Members** intents for the bot.
Use a separate test bot for local development.

## 🚀 Deployment

Work happens on `dev`. A PR into `main` (protected, needs green CI) deploys:

1. `publish.yml` builds the arm64 image, bumps the patch version from the last `vX.Y.*` tag and pushes it to
   `ghcr.io/hoppix/yami_bot` as `:prod`, `:<version>` and `:<commit>`
2. The Raspberry Pi pulls `:prod` every 5 minutes and restarts Yami, see `deploy/docker-compose.yml`

Major and minor versions are bumped by hand with `uv version --bump minor` (or `major`).

## 🔗 Sources

[Kiranico](https://mhworld.kiranico.com) · [YouTube Data API](https://developers.google.com/youtube/) ·
[DnDBeyond](https://www.dndbeyond.com) · [yt-dlp](https://github.com/yt-dlp/yt-dlp)

## 👥 Authors

@IrateGod Irate#0002 <br />
@Rathalos93 Wolf#4328 <br />
@Hoppix Hoppix#6723
