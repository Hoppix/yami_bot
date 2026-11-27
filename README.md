# YAMI_BOT
Discord bot made with nodejs and discordjs

![](yami_image.png)

## Functions
- Plays Youtube videos in voice channel
- Youtube search with query
- Weapon calculation for Monster Hunter
  * Rise
  * World
- Monster Hunter Motionvalue printtables
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
- Python 3.14 and [uv](https://docs.astral.sh/uv/)
- ffmpeg for voice playback
- make
- docker for deployment

### Installation and Deployment
- Clone this repository via ```git clone https://github.com/Hoppix/yami_bot ```
- Install all needed dependencies with ```uv sync```
- Create ``resources/api_config.json `` with
```json
{
  "token": "your discord apikey",
  "youtubeClient": "your google apikey",
} 
```
- Create ``resources/config.json``
```json
{
  "defaultGuildName": "name",
  "defaultGuildId": "id",
  "defaultChannelId": "id",
  "defaultVoiceChannelId": "id",
  "defaultImageChannelId": "id",
  "playMessage": "message that shows as status",
  "commandPrefix": "!",
  "startMessage": "the message at startup",
  "customCommandsPath": "path/to/custom/command/file.json",
  "logFilePath": "path/to/log.txt"
}
```
- Run the application via ```make start```
- Run tests and linting via ```make check``` and ```make lint```
- Production runs as a Docker image on a Raspberry Pi, see ``deploy/docker-compose.yml``

### Authors
@IrateGod Irate#0002 <br />
@Rathalos93 Wolf#4328 <br />
@Hoppix Hoppix#6723
