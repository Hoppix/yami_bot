import { get } from "../mh/mhCalculatorManager.js";
import { youtubeSearchRequest } from "../requestHandler/youtubeHandler.js";
import { writeJSONFile, readJSONFile, writeLogFile } from "../utility/utility.js";
import { customCommandsPath } from "../../resources/config.json";

const sCommandsFile = customCommandsPath;

/**
 * handler vor dispatching action triggered by discord.js message events
 * @type {{}}
 */
export const mCustomCommands = new Map();
export const oMhCalculator = get();
export function executeCustomCommand(sCommand, oMessage) {
    this.updateCommandMap();
    oMessage.reply(this.mCustomCommands.get(sCommand));
}
export function addCustomCommand(aCommand, oMessage) {
    let s = "";

    for (let i = 1; i < aCommand.length; i++) {
        s += aCommand[i] + " ";
    }

    if (!aCommand[0] || !s) {
        oMessage.reply("Must contain valid message!");
        return;
    }

    this.mCustomCommands.set(aCommand[0], s);
    this.saveCommands();
    oMessage.reply("Command: " + aCommand[0] + " added, type: !" + aCommand[0]);
}
export function deleteCustomCommand(aCommand, oMessage) {
    this.mCustomCommands.delete(aCommand[0]);
    this.saveCommands();
    oMessage.reply("Command: " + aCommand[0] + " deleted!");
}
export function printCustomCommands(oMessage) {

    let commands = [];
    this.updateCommandMap();
    this.mCustomCommands.forEach(function(_, key) {
        commands.push({
            name: key,
            value: "##################"
        });
    });

    const oEmbed = {
        embeds: [{
            color: 900000,
            description: "Saved custom commands:",
            fields: commands,
        }]
    };


    oMessage.reply(oEmbed);
}
export function isCustomCommand(sCommand) {
    this.updateCommandMap();
    return this.mCustomCommands.has(sCommand);
}
export function saveCommands() {
    writeJSONFile(sCommandsFile, this.mCustomCommands);
}
export function updateCommandMap() {
    this.mCustomCommands = readJSONFile(sCommandsFile);
}
export async function addRoleToUser(sRoleName, oMessage) {
    const oGuild = oMessage.guild;
    const oUser = oMessage.author;
    const sUserId = oUser.id;

    if (!oMessage.guild) {
        oMessage.reply("Could not determine the server to add the role!");
    }

    const oGuildMember = await oGuild.members.fetch(sUserId);

    const oGuildRolesManager = oGuild.roles;
    const oUserRoleManager = oGuildMember.roles;
    const oHighestRole = oUserRoleManager.highest;

    console.log("search ", sRoleName);

    // Fetch all roles from the guild
    const aRoles = await oGuildRolesManager.fetch();
    const oRoleDesired = aRoles.find(r => r.name.toLowerCase() === sRoleName.toLowerCase());

    if (!oRoleDesired) {
        oMessage.reply("Could not find the given role");
        return;
    }

    if (!oHighestRole) {
        oHighestRole = this._fetchHighestRole(oUserRoleManager, oRoleDesired);
    }

    // Desired role is higher than the users role
    if (oRoleDesired.comparePositionTo(oHighestRole) > 0) {
        oMessage.reply("You do not have the permissions to get this role");
        return;
    }

    // When the user already has the role
    if (oUserRoleManager.cache.get(oRoleDesired.id)) {
        oMessage.reply("You already have the desired role");
        return;
    }

    oGuildMember.roles.add(oRoleDesired, "automated role").catch((error) => {
        writeLogFile("Error ocurred when adding a role: ", error);
    });
    oMessage.reply(oGuildMember.displayName + " now has role " + oRoleDesired.name);
}
export async function _fetchHighestRole(oRoleManager, oRole) {
    console.log("trying to resolve cache of role-manager");
    let role = oRoleManager.find(r => r.name === oRole);
    // just operating on getting the cache
    return oRoleManager.highest;
}
export function getYoutubeSearch(aCommand, oMessage, sApiKey) {
    youtubeSearchRequest(aCommand, sApiKey).then(
        function(oData) {
            if (oData.id && oData.id.videoId) {
                oMessage.reply("https://www.youtube.com/watch?v=" + oData.id.videoId);
                return;
            }

            if (oData.id && oData.id.channelId) {
                oMessage.reply("https://www.youtube.com/channel/" + oData.id.channelId);
                return;
            }
        },
        function(oError) {
            oMessage.reply("Error with" + ": " + oError.message);
        });
}
export function printHelpMessage(oMessage) {
    const oHelp = {
        name: "!help",
        value: "Prints this message"
    };
    const oPlay = {
        name: "!play [youtubelink]",
        value: "Plays youtube video in current voice channel"
    };
    const oStop = {
        name: "!stop",
        value: "Stops playback and leaves channel"
    };
    const oSearch = {
        name: "!youtubesearch [query ...]",
        value: "replies with the first matching youtube-video"
    };
    const oAddCustom = {
        name: "!addcustom [commandname] [text ...]",
        value: "creates a custom command which replies with the given text"
    };

    const oShowCustom = {
        name: "!showcustom",
        value: "prints all saved custom commands"
    };

    const oDeleteCustom = {
        name: "!deletecustom [commandname]",
        value: "Deletes a single command identified by the commandname"
    };

    const oUptime = {
        name: "!uptime:",
        value: "Prints uptime"
    };
    const oMhHelp = {
        name: "!mhhelp",
        value: "Lists available commands for Monster Hunter Weapon calculation"
    };
    const oGiveRole = {
        name: "!giverole",
        value: "Adds you to the given usergroup if you have the rights."
    };
    const oFooter = {
        text: "Please send known bugs to Hoppix#6723/k.hopfmann@hotmail.de"
    };

    const oEmbed = {
        embeds: [{
            color: 900000,
            description: "@Github: https://github.com/Hoppix/yami_bot_js",
            fields: [oHelp, oPlay, oStop, oSearch, oAddCustom, oDeleteCustom, oShowCustom, oUptime, oMhHelp, oGiveRole],
            footer: oFooter
        }]
    };
    oMessage.reply(oEmbed);
}
export function printMhHelpMessage(oMessage) {
    const oWeaponStrength = {
        name: "!weaponstrength [sharpness] [attack] [affinity] [elemental] [weapontype]",
        value: "Calculates the true weapon strength for a certain weapon"
    };
    const oWeaponCompare = {
        name: "!weaponcompare [sharpness1] [attack1] [affinity1] [elemental1] [sharpness2] [attack2] [affinity2] [elemental2] [weapontype]",
        value: "Calculates by how much percent a weapon outperforms the other"
    };
    const oMotionvalue = {
        name: "!motionvalues [weapontype]",
        value: "Lists all the Motionvalues for every specific attack"
    };

    const oKiranicoUrl = {
        name: "!kiranico [category] [object]",
        value: "Generates a kiranico link from the parameters. Example: !kiranico monster, !kiranico item potion"
    };

    const oArmorSets = {
        name: "!armorsets",
        value: "link to a google spreadsheet file"
    };

    const oSharpness = {
        name: "sharpness",
        value: "red, orange, yellow, green, blue, white, purple, gunner"
    };
    const oAttack = {
        name: "attack",
        value: "attack value as shown in game"
    };
    const oElemental = {
        name: "elemental",
        value: "elemental damage as shown in game (0 when none)"
    };
    const oAffinity = {
        name: "affinity",
        value: "a number between 0 and 100"
    };
    const oWeaponType = {
        name: "weapontype",
        value: "sns, ds, gs, ls, hm, hh, lc, gl, sa, cb, ig, bow, lbg, hbg"
    };

    const oFooter = {
        text: "Author: Hoppix#6723, Wolf#4328"
    };

    const oEmbed = {
        embeds: [{
            color: 900000,
            description: "Monster Hunter Calculation commands:",
            fields: [oWeaponStrength, oWeaponCompare, oMotionvalue, oKiranicoUrl, oArmorSets, oSharpness, oAttack, oAffinity, oElemental, oWeaponType],
            footer: oFooter
        }]
    };
    oMessage.reply(oEmbed);
}
export function printUptimeMessage(oUtility, oMessage, oStartedDate) {
    const oUptime = oUtility.uptimeSince(oStartedDate);
    oMessage.reply("Yami has been running for: " + oUptime.hours + " hours, " + oUptime.minutes + " minutes, and " + oUptime.seconds + " seconds.");
}
export function handleWeaponCalculation(aCommand, oMessage) {
    if (aCommand.length !== 5) {
        oMessage.reply("Wrong Parameters!");
        return;
    }
    const sWeaponStrength = oMhCalculator.mhCalculateWeaponStrength(aCommand[0], aCommand[1], aCommand[2], aCommand[3], aCommand[4]);

    if (typeof sWeaponStrength === "string") {
        oMessage.reply("Weapon Strength: " + sWeaponStrength);
        return;
    }
    oMessage.reply("Weapon Strength: " + sWeaponStrength.toFixed(1));
}
export function handleWeaponCompare(aCommand, oMessage) {
    if (aCommand.length !== 9) {
        oMessage.reply("Wrong Parameters!");
        return;
    }
    const oBetterWeapon = oMhCalculator.mhCompareWeapons(aCommand[0], aCommand[1], aCommand[2], aCommand[3], aCommand[4], aCommand[5], aCommand[6], aCommand[7], aCommand[8]);
    oMessage.reply(oBetterWeapon.weapon + " is better by " + ((oBetterWeapon.value * 100).toFixed(1)) + "%");
}
export function getWeaponMV(aCommand, oMessage) {
    if (aCommand.length !== 1) {
        oMessage.reply("Wrong Parameters!");
        return;
    }

    var sWeaponKey = aCommand[0].toUpperCase();
    var mWeaponMV = oMhCalculator.mhMvMapMap.get(sWeaponKey);

    if (mWeaponMV === undefined) {
        oMessage.reply("Invalid Weapontype!");
        return;
    }

    var aFields = [];

    for (key of mWeaponMV) {
        aFields.push({
            name: key[0],
            value: key[1].toString(),
            inline: true
        });
    }

    const oEmbed = {
        embed: {
            color: 900000,
            title: "Motionvalues for " + sWeaponKey + ":",
            fields: aFields
        }
    };
    oMessage.reply(oEmbed);
}
export function getKiranicoUrl(aCommand, oMessage) {
    var sUrl = "https://mhworld.kiranico.com";

    if (aCommand.length === 0) {
        oMessage.reply(sUrl);
    } else if (aCommand.length < 3) {
        for (var i = 0; i < aCommand.length; i++) {
            sUrl = sUrl + "/" + aCommand[i];
        }
        oMessage.reply(sUrl);
    } else {
        oMessage.reply("0-2 parameters required.");
    }
}
export function getArmorSpreadsheetUrl(oMessage) {
    oMessage.reply("https://docs.google.com/spreadsheets/d/1lgLke5tI8LXWylHZnsmF5QTA2vdJGK6lz0N-oHm_3Ls/edit#gid=1065233840");
}
