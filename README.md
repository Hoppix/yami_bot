# YAMI_BOT_JS
Discord bot made with nodejs and discordjs

![](yami_image.png)

## Functions
- Plays Youtube videos in voice channel
- Youtube search with query
- Weapon calculation for Monster Hunter
  * Rise
  * World
- Monster Hunter Motionvalue printtables
- Event Message when a Twitch streamer goes online
- Generating Custom Commands
- Querying DnDBeyond.com for new posts and articles

## In developement
- Searching anime shows on MAL via a command


... This bot is my past time project so any idea I throw at it, so the features may seem a little bit over the place. :)

### Data Sources and APIs
http://kiranico.com/ <br/>
https://3000hunter.com/ <br/>
https://discord.js.org <br/>
https://developers.google.com/youtube/  
https://dndbeyond.com  
https://myanimelist.net

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
  "startMessage": "the message at startup",
  "customCommandsPath": "path/to/custom/command/file.json",
  "logFilePath": "path/to/log.txt"
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
