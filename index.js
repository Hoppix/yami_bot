const Discord = require('discord.js');
const client = new Discord.Client();

var utility = require( __dirname + "/utility.js");

var defaultGuild;
var defaultChannel;

var defaultGuildChannels;
var defaultGuildMembers;


/**
* Initiates default variables
**/
client.on('ready', () =>
{
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setGame(`work in progress`);

  defaultGuild = client.guilds.array()[0];
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

  defaultChannel.send("Now running on Node.js!");

});

/**
* triggered on any message the client receives
**/
client.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
});

client.on("voiceStateUpdate", (oldMember, newMember) =>
{
   var oldChannel = oldMember.voiceChannel;
   var newChannel = newMember.voiceChannel;

   var username = newMember.user.username;

   var newChannelName;
   var oldChannelName;
   var message;

   var time = utility.parseDateString();


   if(!oldChannel && newChannel)
   {
      //user joins channel
      newChannelName = newChannel.name;

      message = time + " | " + "User: " + username + " joined channel: " + newChannelName;
      console.log(message);
      defaultChannel.send(message);
   }
   else if(oldChannel && !newChannel)
   {
     //user leaves channel
     oldChannelName = oldChannel.name;

     message = time + " | " + "User: " + username + " left channel: " + oldChannelName;
     console.log(message);
     defaultChannel.send(message);
   }
   else if(oldChannel && newChannel)
   {
     //user switched channel
     oldChannelName = oldChannel.name;
     newChannelName = newChannel.name;

     message = time + " | " + "User: " + username + " switched from: " + oldChannelName + " to: " + newChannelName;
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


client.login('');
