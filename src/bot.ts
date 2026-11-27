import { Client, Events, GatewayIntentBits, Guild, SendableChannels } from "discord.js";

import oConfig from "../resources/config.json";
import oUtility from "./utility/utility";
import oCacheManager from "./utility/cacheManager";
import oMessageHandler from "./eventHandler/messagehandler";
import oVoiceHandler from "./eventHandler/voicehandler";
import oPresenceHandler from "./eventHandler/presencehandler";
import * as oDndBeyondRequestHandler from "./requestHandler/dndbeyondHandler";
import oYoutubeStreamingHandler from "./eventHandler/youtubeStreamingHandler";
import oWWIGameManager from "./game/whoWroteIt/manager";
import * as oServer from "./healthcheck/server";

interface ApiConfig {
  token: string;
  youtubeClient: string;
}

// api_config.json holds secrets and is not checked in, so it is loaded at runtime instead of imported
const oApiConfig: ApiConfig = require("../resources/api_config.json");

const oClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
});

//starting date for checking uptime
const oStartedDate = new Date();

let oDefaultGuild: Guild | undefined;
let oDefaultChannel: SendableChannels | undefined;

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
oClient.once(Events.ClientReady, async (oReadyClient) => {
  //search for defaultGuild
  oDefaultGuild = await oReadyClient.guilds.fetch(sDefaultGuildId);
  console.log("oDefaultGuild: " + oDefaultGuild.toString());

  //search for channels in defaultGuild
  const defaultGuildChannels = oDefaultGuild.channels.cache;
  if (!defaultGuildChannels) {
    console.log("Guild " + sDefaultGuildName + " has no channels!");
    return;
  }

  //search for defaultChannel in defaultGuild
  const oChannel = defaultGuildChannels.get(sDefaultGuildChannelId);
  if (!oChannel || !oChannel.isSendable()) {
    console.log("No text channel with id " + sDefaultGuildChannelId + " found!");
    return;
  }
  oDefaultChannel = oChannel;
  console.log("oDefaultChannel: " + oChannel.name);

  //search for imageChannel in defaultGuild
  const oDefaultImageChannel = defaultGuildChannels.get(sDefaultImageChannelId);
  if (!oDefaultImageChannel) {
    console.log("No channel with id " + sDefaultImageChannelId + " found!");
    return;
  }
  console.log("oDefaultImageChannel: " + oDefaultImageChannel.name);

  //search for defaultVoiceChannel in defaultGuild
  const oDefaultVoiceChannel = defaultGuildChannels.get(sDefaultVoiceChannelId);
  if (!oDefaultVoiceChannel) {
    console.log("No VoiceChannel with id " + sDefaultVoiceChannelId + " found!");
    return;
  }

  // start dndbeyond post polling
  oDndBeyondRequestHandler.scheduleDndBeyondEvent(oDefaultChannel);

  //initialize persitence for custom commands
  oMessageHandler.updateCommandMap();

  // Set the client user's presence
  oReadyClient.user.setPresence({ activities: [{ name: sPlayMessage }], status: "online" });

  // Start a healthcheck for curling the apps state
  oServer.startHealthcheck();

  oDefaultChannel.send(sStartMessage);

  const aUsers = oCacheManager.fetchCache(oReadyClient.users);
  const aChannels = oCacheManager.fetchCache(oReadyClient.channels);
  const aGuilds = oCacheManager.fetchCache(oReadyClient.guilds);
  console.log(`Bot has started, with ${aUsers.length} users, in ${aChannels.length} channels of ${aGuilds.length} guilds.`);

  const iStartupTime = new Date().getTime() - oStartedDate.getTime();
  console.log("Startup time: " + iStartupTime + "ms");
});

/**
 * triggered on any message the oClient receives
 **/
oClient.on(Events.MessageCreate, async (oMessage) => {
  // Check for any relevant game session
  if (oWWIGameManager.isActive(oMessage)) oWWIGameManager.guessForGame(oMessage);

  if (oMessage.content.charAt(0) !== sCommandPrefix) return;
  if (oMessage.content.length < 2) return;

  const aCommand = oMessage.content.substring(1, oMessage.content.length).split(" ");
  aCommand[0] = aCommand[0].toLowerCase();

  switch (aCommand[0]) {
    /**
     * general functions
     */
    case "play":
      oYoutubeStreamingHandler.playYoutubeLink(aCommand[1], oMessage);
      break;
    case "stop":
      oYoutubeStreamingHandler.stopYoutubeLink();
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
      oMessageHandler.handleWeaponCalculation(aCommand.slice(1), oMessage);
      break;
    case "weaponcompare":
      oMessageHandler.handleWeaponCompare(aCommand.slice(1), oMessage);
      break;
    case "motionvalues":
      oMessageHandler.getWeaponMV(aCommand.slice(1), oMessage);
      break;
    case "armorsets":
      oMessageHandler.getArmorSpreadsheetUrl(oMessage);
      break;
    case "kiranico":
      oMessageHandler.getKiranicoUrl(aCommand.slice(1), oMessage);
      break;
    /**
     * youtube functions
     */
    case "youtubesearch":
      oMessageHandler.getYoutubeSearch(aCommand.slice(1), oMessage, oApiConfig.youtubeClient);
      break;
    /**
     * Custom command functions
     */
    case "addcustom":
      oMessageHandler.addCustomCommand(aCommand.slice(1), oMessage);
      break;
    case "deletecustom":
      oMessageHandler.deleteCustomCommand(aCommand.slice(1), oMessage);
      break;
    case "showcustom":
      oMessageHandler.printCustomCommands(oMessage);
      break;
    /**
     * Adding roles to user
     */
    case "giverole":
      oMessageHandler.addRoleToUser(aCommand.slice(1).join(" "), oMessage);
      break;
    /**
     * get new posts from dndbeyond
     */
    case "dndposts":
      oDndBeyondRequestHandler.getNewPosts(oMessage);
      break;
    default:
      if (oMessageHandler.isCustomCommand(aCommand[0])) {
        oMessageHandler.executeCustomCommand(aCommand[0], oMessage);
      }
  }

  //command logging for error trace
  const oDate = new Date(oMessage.createdAt.valueOf() - oMessage.createdAt.getTimezoneOffset() * 60000);
  const sLog = "Event tigger command: <" + aCommand[0] + "> at " + oDate.toUTCString();
  oUtility.writeLogFile(sLog);
  console.log(sLog);
});

/**
 * Event for logging voiceChannel updates
 **/
oClient.on(Events.VoiceStateUpdate, (oldVoiceState, newVoiceState) => {
  oVoiceHandler.handleEventLogging(oUtility, oldVoiceState, newVoiceState, oDefaultChannel);
});

/**
 * Event for online status etc.
 * Note: only fires when the GuildPresences intent is enabled.
 **/
oClient.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
  //user comes online or goes offline
  if (oldPresence?.status !== newPresence.status) {
    oPresenceHandler.handleStatusUpdate(oUtility, newPresence, oDefaultChannel);
  }
  //user starts playing a game
  else if (oldPresence?.activities[0]?.name !== newPresence.activities[0]?.name) {
    oPresenceHandler.handleGameUpdate(oUtility, newPresence, oDefaultChannel);
  }
});

oClient.on(Events.Error, (oError) => {
  const sMessage = "An generic error haz okuued: " + oError.message;
  console.log(oError);
  console.log(sMessage);
  oUtility.writeLogFile(sMessage);
});

//login with private token from config.json
console.log("PreLogin");
oClient.login(oApiConfig.token).then((r) => console.log("LOGIN EVENT " + r));
console.log("PostLogin");
