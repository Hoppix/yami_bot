const oDiscord = require("discord.js");
const oClient = new oDiscord.Client();

//starting date for checking uptime
const oStartedDate = new Date();

const oConfig = require("./src/config.json");
const oUtility = require("./src/utility.js");
const oMessageHandler = require("./src/eventhandler/messagehandler");
const oVoiceHandler = require("./src/eventhandler/voicehandler");
const oPresenceHandler = require("./src/eventhandler/presencehandler");
const oRequestHandler = require("./src/requestHandler.js");

var oDefaultGuild;
var oDefaultChannel;
var oDefaultVoiceChannel;
var defaultGuildChannels;
var oDefaultImageChannel;

//set your custom names
const sDefaultGuildName = "Zettai Ryouiki";
const sDefaultGuildChannelName = "bot-messages";
const sDefaultVoiceChannelName = "General";
const sDefaultImageChannelName = "pomf";
const sPlayMessage = "Type: !help";
const sCommandPrefix = "!";
const sStartMessage = "v1.8.1 Yami: Refactoring & Fixes!";

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

	//search for imageChannel in defaultGuild
	oDefaultImageChannel = defaultGuildChannels.find("name", sDefaultImageChannelName);
	if (!sDefaultImageChannelName)
	{
		console.log("No channel named " + sDefaultImageChannelName + " found!");
		return;
	}
	console.log("oDefaultImageChannel: " + oDefaultImageChannel.name);

	//search for defaultVoiceChannel in defaultGuild
	oDefaultVoiceChannel = defaultGuildChannels.find("name", sDefaultVoiceChannelName);
	if (!oDefaultVoiceChannel)
	{
		console.log("No VoiceChannel named " + sDefaultVoiceChannelName + " found!");
		return;
	}

	//start twitch api polling
	for (var i = 0; i < oConfig.streamers.length; i++)
	{
		oRequestHandler.pollStream(oDefaultChannel, oConfig.streamers[i], oConfig.twitchClient);
	}

	const iStartupTime = new Date().getTime() - oStartedDate.getTime();
	//log found data + set messages etc.
	console.log(`Bot has started, with ${oClient.users.size} users, in ${oClient.channels.size} channels of ${oClient.guilds.size} guilds.`);
	console.log("Startup time: " + iStartupTime + "ms");
	oClient.user.setGame(sPlayMessage);
	oDefaultChannel.send(sStartMessage);
})
;

/**
 * triggered on any message the oClient receives
 **/
oClient.on('message', message =>
{

	//check for valid Image
	oMessageHandler.checkForValidImageMessage(message,sDefaultImageChannelName, oClient.user);

	if (message.content.charAt(0) !== sCommandPrefix) return;


	var aCommand = message.content.substring(1, message.content.length).split(" ");
	aCommand[0].toLowerCase();

	switch (aCommand[0])
	{
		case "play":
			oMessageHandler.playYoutubeLink(aCommand[1], message, oClient);
			break;
		case "stop":
			oMessageHandler.stopYoutubeLink(oClient);
			break;
		case "help":
			oMessageHandler.printHelpMessage(message);
			break;
		case "mhhelp":
			oMessageHandler.printMhHelpMessage(message);
			break;
		case "uptime":
			oMessageHandler.printUptimeMessage(oUtility, message, oStartedDate);
			break;
		case "weaponstrength":
			oMessageHandler.handleWeaponCalculation(aCommand.slice(1, aCommand.length), message);
			break;
		case "weaponcompare":
			oMessageHandler.handleWeaponCompare(aCommand.slice(1, aCommand.length), message);
			break;
		case "motionvalues":
			oMessageHandler.getWeaponMV(aCommand.slice(1, aCommand.length), message);
			break;
		case "armorsets":
			oMessageHandler.getArmorSpreadsheetUrl(message);
			break;
		case "kiranico":
				oMessageHandler.getKiranicoUrl(aCommand.splice(1, aCommand.length), message);
			break;
		default:
			message.reply("Wrong arguments provided!");
	}

	//command logging for error trace
	const oDate = new Date(message.createdAt.valueOf() - message.createdAt.getTimezoneOffset() * 60000);
	const sLog = "Event tigger command: <" + aCommand[0] + "> at " + oDate.toUTCString();
	oUtility.writeLogFile(sLog);
	console.log(sLog);
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
console.log("PreLogin");
oClient.login(oConfig.token);
console.log("PostLogin");
