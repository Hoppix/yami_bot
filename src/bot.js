import { Client, GatewayIntentBits } from "discord.js";

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

import { youtubeClient, token } from "../resources/api_config.json";
import { version, defaultGuildName, defaultGuildId, defaultChannelId, defaultVoiceChannelId, defaultImageChannelId, playMessage, commandPrefix, startMessage } from "../resources/config.json";
import oUtility, { writeLogFile } from "./utility/utility.js";
import { fetchCache } from "./utility/cacheManager.js";
import { updateCommandMap, printHelpMessage, printMhHelpMessage, printUptimeMessage, handleWeaponCalculation, handleWeaponCompare, getWeaponMV, getArmorSpreadsheetUrl, getKiranicoUrl, getYoutubeSearch, addCustomCommand, deleteCustomCommand, printCustomCommands, addRoleToUser, isCustomCommand, executeCustomCommand } from "./eventHandler/messagehandler";
import { handleEventLogging } from "./eventHandler/voicehandler";
import { handleStatusUpdate, handleGameUpdate } from "./eventHandler/presencehandler";
import { scheduleDndBeyondEvent, getNewPosts } from "./requestHandler/dndbeyondHandler.js";
import { playYoutubeLink, stopYoutubeLink } from "./eventHandler/youtubeStreamingHandler.js";
import { isActive, guessForGame, delegate } from "./game/whoWroteIt/manager";
import { startHealthcheck } from "./healthcheck/server";

var oDefaultGuild;
var oDefaultChannel;
var oDefaultVoiceChannel;
var defaultGuildChannels;
var oDefaultImageChannel;

// load config
const sVersion = version;
const sDefaultGuildName = defaultGuildName;
const sDefaultGuildId = defaultGuildId;
const sDefaultGuildChannelId = defaultChannelId;
const sDefaultVoiceChannelId = defaultVoiceChannelId;
const sDefaultImageChannelId = defaultImageChannelId;
const sPlayMessage = playMessage;
const sCommandPrefix = commandPrefix;
const sStartMessage = sVersion + " " + startMessage;

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
  scheduleDndBeyondEvent(oDefaultChannel);

  //initialize persitence for custom commands
  updateCommandMap();

  // Set the client user's presence
  oClient.user.setPresence({ activities: [{ name: sPlayMessage }], status: sVersion });

  // Start a healthcheck for curling the apps state
  startHealthcheck()

  oDefaultChannel.send(sStartMessage);

  const aUsers = fetchCache(oClient.users);
  const aChannels = fetchCache(oClient.channels);
  const aGuilds = fetchCache(oClient.guilds);
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
  if (isActive(oMessage)) 
    guessForGame(oMessage);

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
      playYoutubeLink(aCommand[1], oMessage, oClient);
      break;
    case "stop":
      stopYoutubeLink(oClient);
      break;
    case "help":
      printHelpMessage(oMessage);
      break;
    case "mhhelp":
      printMhHelpMessage(oMessage);
      break;
    case "uptime":
      printUptimeMessage(oUtility, oMessage, oStartedDate);
      break;
    /**
     * Game functions
     */
    case "wwi":
      delegate(oMessage);
      break;
    /**
     * Monster hunter functions
     */
    case "weaponstrength":
      handleWeaponCalculation(
        aCommand.slice(1, aCommand.length),
        oMessage
      );
      break;
    case "weaponcompare":
      handleWeaponCompare(
        aCommand.slice(1, aCommand.length),
        oMessage
      );
      break;
    case "motionvalues":
      getWeaponMV(aCommand.slice(1, aCommand.length), oMessage);
      break;
    case "armorsets":
      getArmorSpreadsheetUrl(oMessage);
      break;
    case "kiranico":
      getKiranicoUrl(
        aCommand.splice(1, aCommand.length),
        oMessage
      );
      break;
    /**
     * youtube functions
     */
    case "youtubesearch":
      getYoutubeSearch(
        aCommand.splice(1, aCommand.length),
        oMessage,
        youtubeClient
      );
      break;
    /**
     * Custom command functions
     */
    case "addcustom":
      addCustomCommand(
        aCommand.splice(1, aCommand.length),
        oMessage
      );
      break;
    case "deletecustom":
      deleteCustomCommand(
        aCommand.splice(1, aCommand.length),
        oMessage
      );
      break;
    case "showcustom":
      printCustomCommands(oMessage);
      break;
    /**
     * Adding roles to user
     */
    case "giverole":
      addRoleToUser(
        aCommand.splice(1, aCommand.length).join(" "),
        oMessage
      );
      break;
    /**
     * get new posts from dndbeyond
     */
    case "dndposts":
      getNewPosts(oMessage)
      break;
    default:
      if (isCustomCommand(aCommand[0])) {
        executeCustomCommand(aCommand[0], oMessage);
      }
  }

  //command logging for error trace
  const oDate = new Date(
    oMessage.createdAt.valueOf() -
    oMessage.createdAt.getTimezoneOffset() * 60000
  );
  const sLog =
    "Event tigger command: <" + aCommand[0] + "> at " + oDate.toUTCString();
  writeLogFile(sLog);
  console.log(sLog);
});

/**
 * Event for logging voiceChannel updates
 **/
oClient.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
  handleEventLogging(
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
    handleStatusUpdate(
      oUtility,
      newMember,
      oldMember,
      oDefaultChannel
    );
  }
  //user starts playing a game
  else if (oldMember.presence.game !== newMember.presence.game) {
    handleGameUpdate(
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
  writeLogFile(sMessage);
});

//login with private token from config.json
console.log("PreLogin");
oClient.login(token).then((r) => console.log("LOGIN EVENT " + r));
console.log("PostLogin");
