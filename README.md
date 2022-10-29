# YAMI_BOT_JS
Discord bot made with nodejs and discordjs

## Functions
- Plays Youtube videos in voice channel
- Youtube search with query
- Weapon calculation for Monster Hunter
  * Rise
  * World
- Motionvalue printtables
- Event Message when Streamer goes online
- Generating Custom Commands
- Queryin DnDBeyond.com for new posts and articles

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
https://dndbeyond.com  

### Prerequisites
- Nodejs
- Discord.js
- YTDL with ffmpeg
- tsc typescript compiler
- make
- docker for deployment

### Installation and Deployment
- Clone this repository via ```git clone https://github.com/Hoppix/yami_bot_js ```
- Install all needed dependencies with ````npm install ````
- Create ``resources/commands/custom.json`` for custom command persistence
- Create ``resources/api_config.json `` with
```json
{
  "token": "your discord apikey",
  "twitchClient": "your twitch apikey",
  "youtubeClient": "your google apikey",
} 
```
- Create ``resources/config.json``
```json
{
  "streamers": [
    "streamer name here for notifications"
  ],
  "defaultGuildName": "name",
  "defaultGuildId": "id",
  "defaultChannelId": "id",
  "defaultVoiceChannelId": "id",
  "defaultImageChannelId": "id",
  "version": "1.0.0",
  "playMessage": "message that shows as status",
  "commandPrefix": "!",
  "startMessage": "the message at startup"
}
```
- Build the application via make: ```make compile```
- Run the application via ```make start```
- For running it on a server it´s recommended to use the provided Docker image:
  - Run ``./ci/build_and_run.sh``

### Authors
@IrateGod Irate#0002 <br />
@Rathalos93 Wolf#4328 <br />
@Hoppix Hoppix#6723
