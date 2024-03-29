const { Client, GatewayIntentBits } = require("discord.js");

const intents = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ]
}
const oClient = new Client(intents);

//starting date for checking uptime
const oStartedDate = new Date();

const oApiConfig = require("../resources/api_config.json");
const oConfig = require("../resources/config.json");
const oUtility = require("./utility/utility.js");
const oCacheManager = require("./utility/cacheManager.js");
const oMessageHandler = require("./eventHandler/messagehandler");
const oVoiceHandler = require("./eventHandler/voicehandler");
const oPresenceHandler = require("./eventHandler/presencehandler");
const oRequestHandler = require("./requestHandler/twitchRequestHandler.js");
const oDndBeyondRequestHandler = require("./requestHandler/dndbeyondHandler.js");
const oYoutubeStreamingHandler = require("./eventHandler/youtubeStreamingHandler.js");
const oWWIGameManager = require("./game/whoWroteIt/manager")
const oServer = require("./healthcheck/server");

var oDefaultGuild;
var oDefaultChannel;
var oDefaultVoiceChannel;
var defaultGuildChannels;
var oDefaultImageChannel;

// load config
const sVersion = oConfig.version;
const sDefaultGuildName = oConfig.defaultGuildName;
const sDefaultGuildId = oConfig.defaultGuildId;
const sDefaultGuildChannelId = oConfig.defaultChannelId;
const sDefaultVoiceChannelId = oConfig.defaultVoiceChannelId;
const sDefaultImageChannelId = oConfig.defaultImageChannelId;
const sPlayMessage = oConfig.playMessage;
const sCommandPrefix = oConfig.commandPrefix;
const sStartMessage = sVersion + " " + oConfig.startMessage;

/**
 * Initiates default variables
 **/
oClient.on("ready", async () => {
  //search for defaultGuild
  oDefaultGuild = await oClient.guilds.fetch(sDefaultGuildId);
  console.log("oDefaultGuild: " + oDefaultGuild.toString());

  //search for channels in defaultGuild
  defaultGuildChannels = oDefaultGuild.channels.cache;
  if (!defaultGuildChannels) {
    console.log("Guild " + sDefaultGuildName + " has no channels!");
    return;
  }

  //search for defaultChannel in defaultGuild
  oDefaultChannel = defaultGuildChannels.get(sDefaultGuildChannelId);
  if (!oDefaultChannel) {
    console.log("No channel with id " + sDefaultGuildChannelId + " found!");
    return;
  }
  console.log("oDefaultChannel: " + oDefaultChannel.name);

  //search for imageChannel in defaultGuild
  oDefaultImageChannel = defaultGuildChannels.get(sDefaultImageChannelId);
  if (!oDefaultImageChannel) {
    console.log("No channel with id " + sDefaultImageChannelId + " found!");
    return;
  }
  console.log("oDefaultImageChannel: " + oDefaultImageChannel.name);

  //search for defaultVoiceChannel in defaultGuild
  oDefaultVoiceChannel = defaultGuildChannels.get(sDefaultVoiceChannelId);
  if (!oDefaultVoiceChannel) {
    console.log(
      "No VoiceChannel with id " + sDefaultVoiceChannelId + " found!"
    );
    return;
  }

  // start dndbeyond post polling
  oDndBeyondRequestHandler.scheduleDndBeyondEvent(oDefaultChannel);

  //initialize persitence for custom commands
  oMessageHandler.updateCommandMap();

  // Set the client user's presence
  oClient.user.setPresence({ activities: [{ name: sPlayMessage }], status: sVersion });

  // Start a healthcheck for curling the apps state
  oServer.startHealthcheck()

  oDefaultChannel.send(sStartMessage);

  const aUsers = oCacheManager.fetchCache(oClient.users);
  const aChannels = oCacheManager.fetchCache(oClient.channels);
  const aGuilds = oCacheManager.fetchCache(oClient.guilds);
  console.log(
    `Bot has started, with ${aUsers.length} users, in ${aChannels.length} channels of ${aGuilds.length} guilds.`
  );

  const iStartupTime = new Date().getTime() - oStartedDate.getTime();
  console.log("Startup time: " + iStartupTime + "ms");
});

/**
 * triggered on any message the oClient receives
 **/
oClient.on("messageCreate", async (oMessage) => {

  // Check for any relevant game session
  if (oWWIGameManager.isActive(oMessage)) 
    oWWIGameManager.guessForGame(oMessage);

  if (oMessage.content.charAt(0) !== sCommandPrefix) return;
  if (oMessage.content.length < 2) return;

  var aCommand = oMessage.content
    .substring(1, oMessage.content.length)
    .split(" ");
  aCommand[0].toLowerCase();

  switch (aCommand[0]) {
    /**
     * general functions
     */
    case "play":
      oYoutubeStreamingHandler.playYoutubeLink(aCommand[1], oMessage, oClient);
      break;
    case "stop":
      oYoutubeStreamingHandler.stopYoutubeLink(oClient);
      break;
    case "help":
      oMessageHandler.printHelpMessage(oMessage);
      break;
    case "mhhelp":
      oMessageHandler.printMhHelpMessage(oMessage);
      break;
    case "uptime":
      oMessageHandler.printUptimeMessage(oUtility, oMessage, oStartedDate);
      break;
    /**
     * Game functions
     */
    case "wwi":
      oWWIGameManager.delegate(oMessage);
      break;
    /**
     * Monster hunter functions
     */
    case "weaponstrength":
      oMessageHandler.handleWeaponCalculation(
        aCommand.slice(1, aCommand.length),
        oMessage
      );
      break;
    case "weaponcompare":
      oMessageHandler.handleWeaponCompare(
        aCommand.slice(1, aCommand.length),
        oMessage
      );
      break;
    case "motionvalues":
      oMessageHandler.getWeaponMV(aCommand.slice(1, aCommand.length), oMessage);
      break;
    case "armorsets":
      oMessageHandler.getArmorSpreadsheetUrl(oMessage);
      break;
    case "kiranico":
      oMessageHandler.getKiranicoUrl(
        aCommand.splice(1, aCommand.length),
        oMessage
      );
      break;
    /**
     * youtube functions
     */
    case "youtubesearch":
      oMessageHandler.getYoutubeSearch(
        aCommand.splice(1, aCommand.length),
        oMessage,
        oApiConfig.youtubeClient
      );
      break;
    /**
     * Custom command functions
     */
    case "addcustom":
      oMessageHandler.addCustomCommand(
        aCommand.splice(1, aCommand.length),
        oMessage
      );
      break;
    case "deletecustom":
      oMessageHandler.deleteCustomCommand(
        aCommand.splice(1, aCommand.length),
        oMessage
      );
      break;
    case "showcustom":
      oMessageHandler.printCustomCommands(oMessage);
      break;
    /**
     * Adding roles to user
     */
    case "giverole":
      oMessageHandler.addRoleToUser(
        aCommand.splice(1, aCommand.length).join(" "),
        oMessage
      );
      break;
    /**
     * get new posts from dndbeyond
     */
    case "dndposts":
      oDndBeyondRequestHandler.getNewPosts(oMessage)
      break;
    default:
      if (oMessageHandler.isCustomCommand(aCommand[0])) {
        oMessageHandler.executeCustomCommand(aCommand[0], oMessage);
      }
  }

  //command logging for error trace
  const oDate = new Date(
    oMessage.createdAt.valueOf() -
    oMessage.createdAt.getTimezoneOffset() * 60000
  );
  const sLog =
    "Event tigger command: <" + aCommand[0] + "> at " + oDate.toUTCString();
  oUtility.writeLogFile(sLog);
  console.log(sLog);
});

/**
 * Event for logging voiceChannel updates
 **/
oClient.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
  oVoiceHandler.handleEventLogging(
    oUtility,
    oldVoiceState,
    newVoiceState,
    oDefaultChannel
  );
});

/**
 * Event for online status etc.
 **/
oClient.on("presenceUpdate", (oldMember, newMember) => {
  //user comes online or goes offline
  if (oldMember.presence.status !== newMember.presence.status) {
    oPresenceHandler.handleStatusUpdate(
      oUtility,
      newMember,
      oldMember,
      oDefaultChannel
    );
  }
  //user starts playing a game
  else if (oldMember.presence.game !== newMember.presence.game) {
    oPresenceHandler.handleGameUpdate(
      oUtility,
      newMember,
      oldMember,
      oDefaultChannel
    );
  }
});

oClient.on("error", (oError) => {
  const sMessage = "An generic error haz okuued: " + oError.message;
  console.log(oError)
  console.log(sMessage);
  oUtility.writeLogFile(sMessage);
});

//login with private token from config.json
console.log("PreLogin");
oClient.login(oApiConfig.token).then((r) => console.log("LOGIN EVENT " + r));
console.log("PostLogin");
