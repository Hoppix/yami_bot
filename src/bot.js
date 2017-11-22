const Discord = require('discord.js');
const client = new Discord.Client();

var utility = require( __dirname + "/utility.js");
var config =  require('./config.json')

var defaultGuild;
var defaultChannel;
var defaultVoiceChannel;

var defaultGuildChannels;
var defaultGuildMembers;

var started;


/**
* Initiates default variables
**/
client.on('ready', () =>
{
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setGame(`Type: yami help`);

  defaultGuild = client.guilds.array()[1];
  if(!defaultGuild)
  {
    console.log("no guilds found!");
    return;
  }
  console.log("defaultGuild: " + defaultGuild.toString());

  defaultGuildChannels = defaultGuild.channels;
  if(!defaultGuildChannels)
  {
    console.log("guild has no channels");
    return;
  }
  console.log("defaultGuildChannels: " + defaultGuildChannels.toString());

  defaultChannel = defaultGuildChannels.find("name", "debugging");

  if(!defaultChannel)
  {
    console.log("no debug channel found! where am I?")
  }
  console.log("defaultChannel: " + defaultChannel.name)

  defaultVoiceChannel = defaultGuildChannels.find("name", "Manu-rage-Kuppel");

  started = new Date();

  defaultChannel.send("Now running on Node.js!");

});

/**
* triggered on any message the client receives
**/
client.on('message', message =>
{

  var respondChan = message.channel;
  var cmd = message.content.split(" ");
  if(cmd[0] == "yami")
  {
    if(cmd[1] == "play")
    {
      if(cmd[2] !== undefined)
      {
        var ytl = cmd[2];

        if(message.member.voiceChannel)
        {
          defaultVoiceChannel = message.member.voiceChannel;
        }
        if(!defaultVoiceChannel) return;
        // Play streams using ytdl-core
        const ytdl = require('ytdl-core');
        const streamOptions = { seek: 0, volume: 0.2 };
        const broadcast = client.createVoiceBroadcast();

        defaultVoiceChannel.join()
          .then(connection => {
            const stream = ytdl(ytl, { filter : 'audioonly' });
            broadcast.playStream(stream);
            const dispatcher = connection.playBroadcast(broadcast);
          })
          .catch(console.error);
      }
    }
    else if(cmd[1] == "stop")
    {
      //TODO error handling when not in channel
      client.voiceConnections.array()[0].disconnect();
      defaultVoiceChannel.leave();
    }
    else if(cmd[1] == "help")
    {
      //TODO print help msg
      var embed = {embed: {
                            color: 3447003,
                            description: "\"yami help\": prints this message \n \"yami play\ <youtubelink>\": plays youtube video in current voice channel \n \"yami stop\": stops playback"
                          }}
      respondChan.send(embed);

    }
    else if (cmd[1] == "uptime")
    {
      var oUptime = utility.uptimeSince(started);
      var message = "Yami has been running for: " + oUptime.hours + " hours, " + oUptime.minutes + " minutes, and " + oUptime.seconds + " seconds.";

      respondChan.send(message);
      console.log(message);
    }
  }
});

/**
* Event for logging voiceChannel updates
**/
client.on("voiceStateUpdate", (oldMember, newMember) =>
{
   var oldChannel = oldMember.voiceChannel;
   var newChannel = newMember.voiceChannel;

   var username = newMember.user.username;

   var newChannelName;
   var oldChannelName;
   var message;

   var time = utility.parseDateString() + " | ";


   if(!oldChannel && newChannel)
   {
      //user joins channel
      newChannelName = newChannel.name;

      message = time + "User: " + username + " joined channel: " + newChannelName;
      console.log(message);
      defaultChannel.send(message);
   }
   else if(oldChannel && !newChannel)
   {
     //user leaves channel
     oldChannelName = oldChannel.name;

     message = time + "User: " + username + " left channel: " + oldChannelName;
     console.log(message);
     defaultChannel.send(message);
   }
   else if(oldChannel && newChannel)
   {
     //user switched channel
     oldChannelName = oldChannel.name;
     newChannelName = newChannel.name;

     if(oldChannelName == newChannelName) return;

     message = time + "User: " + username + " switched from: " + oldChannelName + " to: " + newChannelName;
     console.log(message);
     defaultChannel.send(message);
   }
   else
   {
     //nothing happened
     console.log("wtf?");
   }
   utility.writeLogFile(message);

});


client.on("presenceUpdate", (oldMember, newMember) => {

    var time = utility.parseDateString() + " | ";

    //user comes online or goes offline
    if(oldMember.presence.status !== newMember.presence.status)
    {
        var newPresence = newMember.presence.status;
        var message = time + "User "+ newMember.user.username + " went " + newPresence;

        console.log(message);
        defaultChannel.send(message);
        utility.writeLogFile(message);
    }
    //user starts playing a game
    else if(oldMember.presence.game !== newMember.presence.game)
    {
      if(newMember.presence.game == null || newMember.presence.game == undefined ) return;

       var newPresence = newMember.presence.game.name;
       var message = time + "User "+ oldMember.user.username + " is now playing: " + newPresence;

       console.log(message);
       defaultChannel.send(message);
       utility.writeLogFile(message);
    }
});

client.login(config.token);
