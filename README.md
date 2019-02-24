# YAMI_BOT_JS
Discord bot made with nodejs and discordjs

## Functions
- Plays Youtube videos in voice channel
- Youtube search with query
- Weapon calculation for Monster Hunter World
- Motionvalue printtables
- Event Message when Streamer goes online
- Generating Custom Commands

#### How Weapon Strength is calculated
Since actual damage in Monster Hunter is very variable, we estimate certain values to generalize parts of the calculation so that the weapon itself is the deciding factor: The raw weapon damage is calculated as usual, then we define resistance values for a default target dummy that is an average of most monster resistances. Afterwards we calculate the average motion value per hit for the weapontype used. This is important for the fact that in the raw weapon calculation elemental damage is a very small percentage, but since we want to simulate the weapon performance as accurate as possible without setting special values for target and move, we use those dummy values.

## In Developement
- Monster printtables
- Calculating best weapon average.
- Using data for calculating best weapon for certain monsters.

### Data Sources and APIs
http://kiranico.com/ <br/>
https://3000hunter.com/ <br/>
https://discord.js.org <br/>
https://scryfall.com <br/>
https://developers.google.com/youtube/

### Installation and Deployment
- Clone this repository via ```git clone https://github.com/Hoppix/yami_bot_js ```
- Install all needed dependencies with ````npm install ````
- Create ``/commands/custom.json`` for custom command persistence
- Create ``src/config.json `` with
``
{
  "token": "your discord apikey",
  "twitchClient": "your twitch apikey",
  "youtubeClient": "your google apikey",
  "streamers": ["streamer1", "streamer2", "streamer3"]
} 
``
- Go to ``bot.js`` and change the values for sDefaultGuildName, sDefaultGuildChannelName, sDefaultVoiceChannelName, sPlayMessage, sCommandPrefix, sStartMessage
- Start the Bot with ``nodejs bot.js``

### Authors
@IrateGod Irate#0002 <br />
@Rathalos93 Wolf#4328 <br />
@Hoppix Hoppix#6723
