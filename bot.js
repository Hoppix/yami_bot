const oDiscord = require("discord.js");
const oClient = new oDiscord.Client();

const oConfig = require("./src/config.json");
const oUtility = require("./src/utility.js");
const oVoiceHandler = require("./src/eventhandler/voicehandler");
const oMessageHandler = require("./src/eventhandler/messagehandler");
const oPresenceHandler = require("./src/eventhandler/presencehandler");

const oStartedDate = new Date();

var oDefaultGuild;
var oDefaultChannel;
var oDefaultVoiceChannel;
var defaultGuildChannels;

//set your custom names
const sDefaultGuildName = "Zettai Ryouiki";
const sDefaultGuildChannelName = "debugging";
const sDefaultVoiceChannelName = "General";
const sPlayMessage = "Type: yami help";
const sCommandPrefix = "yami";

/**
 * Initiates default variables
 **/
oClient.on('ready', () =>
{
	//search for defaultGuild
	oDefaultGuild = oClient.guilds.find("name", sDefaultGuildName);
	if (!oDefaultGuild)
	{
		console.log("No guild named " + sDefaultGuildName + " found!");
		return;
	}
	console.log("oDefaultGuild: " + oDefaultGuild.toString());

	//search for channels in defaultGuild
	defaultGuildChannels = oDefaultGuild.channels;
	if (!defaultGuildChannels)
	{
		console.log("Guild " + sDefaultGuildName + " has no channels!");
		return;
	}
	console.log("oDefaultGuildChannels: " + defaultGuildChannels.toString());

	//search for defaultChannel in defaultGuild
	oDefaultChannel = defaultGuildChannels.find("name", sDefaultGuildChannelName);
	if (!oDefaultChannel)
	{
		console.log("No channel named " + sDefaultGuildChannelName + " found!");
		return;
	}
	console.log("oDefaultChannel: " + oDefaultChannel.name);

	//search for defaultVoiceChannel in defaultGuild
	oDefaultVoiceChannel = defaultGuildChannels.find("name", sDefaultVoiceChannelName);
	if (!oDefaultVoiceChannel)
	{
		console.log("No VoiceChannel named " + sDefaultVoiceChannelName + " found!");
		return;
	}

	//log found data + set messages etc.
	console.log(`Bot has started, with ${oClient.users.size} users, in ${oClient.channels.size} channels of ${oClient.guilds.size} guilds.`);
	oClient.user.setGame(sPlayMessage);
	oDefaultChannel.send("Now running on Node.js!");

});

/**
 * triggered on any message the oClient receives
 **/
oClient.on('message', message =>
{
	var aCommand = message.content.split(" ");

	if (aCommand[0] === sCommandPrefix)
	{
		switch (aCommand[1])
		{
			case "play":
				oMessageHandler.playYoutubeLink(aCommand[2], message, oClient);
				break;
			case "stop":
				oMessageHandler.stopYoutubeLink(oClient);
				break;
			case "help":
				oMessageHandler.printHelpMessage(message);
				break;
			case "uptime":
				oMessageHandler.printUptimeMessage(oUtility, message, oStartedDate);
				break;
			default:
				message.reply("No arguments provided!");
		}
	}
});

/**
 * Event for logging voiceChannel updates
 **/
oClient.on("voiceStateUpdate", (oldMember, newMember) =>
{
	oVoiceHandler.handleEventLogging(oUtility, oldMember, newMember, oDefaultChannel);
});

/**
 * Event for online status etc.
 **/
oClient.on("presenceUpdate", (oldMember, newMember) =>
{
	//user comes online or goes offline
	if (oldMember.presence.status !== newMember.presence.status)
	{
		oPresenceHandler.handleStatusUpdate(oUtility, newMember, oldMember, oDefaultChannel);
	}

	//user starts playing a game
	else if (oldMember.presence.game !== newMember.presence.game)
	{
		oPresenceHandler.handleGameUpdate(oUtility, newMember, oldMember, oDefaultChannel);
	}
});

//login with private token from config.json
oClient.login(oConfig.token);
