const oDiscord = require("discord.js");
const oClient = new oDiscord.Client();

//starting date for checking uptime
const oStartedDate = new Date();

const oConfig = require("./src/config.json");
const oUtility = require("./src/utility.js");
const oMessageHandler = require("./src/eventhandler/messagehandler");
const oVoiceHandler = require("./src/eventhandler/voicehandler");
const oPresenceHandler = require("./src/eventhandler/presencehandler");

var oDefaultGuild;
var oDefaultChannel;
var oDefaultVoiceChannel;
var defaultGuildChannels;

//set your custom names
const sDefaultGuildName = "Zettai Ryouiki";
const sDefaultGuildChannelName = "debugging";
const sDefaultVoiceChannelName = "General";
const sPlayMessage = "Type: !help";
const sCommandPrefix = "!";
const sStartMessage = "v1.5 Yami: Weapon Motionvalues now available!";



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

	const iStartupTime = new Date().getTime() - oStartedDate.getTime();
	//log found data + set messages etc.
	console.log(`Bot has started, with ${oClient.users.size} users, in ${oClient.channels.size} channels of ${oClient.guilds.size} guilds.`);
	console.log("Startup time: " + iStartupTime + "ms");
	oClient.user.setGame(sPlayMessage);
	oDefaultChannel.send(sStartMessage);

});

/**
 * triggered on any message the oClient receives
 **/
oClient.on('message', message =>
{
	if (message.content.charAt(0) !== sCommandPrefix) return;

	message.content = message.content.toLowerCase();
	var aCommand = message.content.substring(1, message.content.length).split(" ");

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
		default:
			message.reply("Wrong arguments provided!");
	}

});

//login with private token from config.json
oClient.login(oConfig.token);
