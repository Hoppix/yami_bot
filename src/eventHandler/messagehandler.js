const oMhCalculatorManager = require("../mh/mhCalculatorManager.js");
const oYoutubeHandler = require("../requestHandler/youtubeHandler.js");
const oUtility = require("../utility/utility.js");
const oConfig = require("../../resources/config.json")

const sCommandsFile = oConfig.customCommandsPath;

/**
 * handler vor dispatching action triggered by discord.js message events
 * @type {{}}
 */
module.exports = {

    mCustomCommands: new Map(), // Map for saving dynamic generated commands
    oMhCalculator: oMhCalculatorManager.get(),

    /**
     *    runs a command saved in the command map
     *
     * @param sCommand
     * @param oMessage
     */
    executeCustomCommand: function(sCommand, oMessage) {
        this.updateCommandMap();
        oMessage.reply(this.mCustomCommands.get(sCommand));
    },

    /**
     * adds a command to the command map
     *
     * @param aCommand
     * @param oMessage
     */
    addCustomCommand: function(aCommand, oMessage) {
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
    },

    /**
     * delete a comnmand from the command map, identified by the command key
     * @param aCommand
     * @param oMessage
     */
    deleteCustomCommand: function(aCommand, oMessage) {
        this.mCustomCommands.delete(aCommand[0]);
        this.saveCommands();
        oMessage.reply("Command: " + aCommand[0] + " deleted!");
    },

    printCustomCommands: function(oMessage) {
        const oEmbed = {
            embeds: [{
                color: 900000,
                description: "Saved custom commands:",
                fields: [],
            }]
        };

        this.updateCommandMap();
        this.mCustomCommands.forEach(function(value, key) {
            oEmbed.embeds.fields.push({
                name: key,
                value: "##################"
            });
        });

        oMessage.reply(oEmbed)
    },

    /**
     * checks if sCommand is a custom command
     *
     * @param sCommand
     * @returns {boolean}
     */
    isCustomCommand: function(sCommand) {
        this.updateCommandMap();
        return this.mCustomCommands.has(sCommand);
    },

    /**
     * saves the @mCustomCommands map to the persistence file
     */
    saveCommands: function() {
        oUtility.writeJSONFile(sCommandsFile, this.mCustomCommands);
    },

    /**
     * updates the command map from the persistence file
     */
    updateCommandMap: function() {
        this.mCustomCommands = oUtility.readJSONFile(sCommandsFile);
    },


    /**
     * adds a role to the user, if the user has the rights for this role
     */
    addRoleToUser: async function(sRoleName, oMessage) {
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

        console.log("search ", sRoleName)

        // Fetch all roles from the guild
        const aRoles = await oGuildRolesManager.fetch()
        const oRoleDesired = aRoles.find(r => r.name.toLowerCase() === sRoleName.toLowerCase());

        if (!oRoleDesired) {
            oMessage.reply("Could not find the given role")
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
            oUtility.writeLogFile("Error ocurred when adding a role: ", error)
        });
        oMessage.reply(oGuildMember.displayName + " now has role " + oRoleDesired.name);
    },

    async _fetchHighestRole(oRoleManager, oRole) {
        console.log("trying to resolve cache of role-manager");
        let role = oRoleManager.find(r => r.name === oRole);
        // just operating on getting the cache
        return oRoleManager.highest;
    },

    /**
     *     calls the requesthandler to search with the given query for the first matching youtube-video
     *     and replies to the commanding user
     *   @param aCommand
     *   @param oMessage
     */
    getYoutubeSearch: function(aCommand, oMessage, sApiKey) {
        oYoutubeHandler.youtubeSearchRequest(aCommand, sApiKey).then(
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
    },

    /**
     *    Responds with an embed message containing all the existing general commands
     **/
    printHelpMessage: function(oMessage) {
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
    },

    /**
     *    Responds with an embed message containting
     *    all the available monster hunter world commands
     **/
    printMhHelpMessage: function(oMessage) {
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
    },

    /**
     * replies with a message containing the total uptime
     **/
    printUptimeMessage: function(oUtility, oMessage, oStartedDate) {
        const oUptime = oUtility.uptimeSince(oStartedDate);
        oMessage.reply("Yami has been running for: " + oUptime.hours + " hours, " + oUptime.minutes + " minutes, and " + oUptime.seconds + " seconds.");
    },

    /**
     *    receives the message and calculates the weapon Strength
     *    using the mhCalculator
     **/
    handleWeaponCalculation: function(aCommand, oMessage) {
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
    },

    /**
     *    receives the message and compares the weapon stength of
     *    two weapons and compares them using the mhCalculator
     **/
    handleWeaponCompare: function(aCommand, oMessage) {
        if (aCommand.length !== 9) {
            oMessage.reply("Wrong Parameters!");
            return;
        }
        const oBetterWeapon = oMhCalculator.mhCompareWeapons(aCommand[0], aCommand[1], aCommand[2], aCommand[3], aCommand[4], aCommand[5], aCommand[6], aCommand[7], aCommand[8]);
        oMessage.reply(oBetterWeapon.weapon + " is better by " + ((oBetterWeapon.value * 100).toFixed(1)) + "%");
    },

    /**
     *    receives the message and responds with an embed containing all
     *    the motionvalues for a specified weapon using the mhCalculator
     **/
    getWeaponMV: function(aCommand, oMessage) {
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
    },

    /**
     * responds with a kiranico url generated by params
     * @param aCommand
     * @param oMessage
     */
    getKiranicoUrl: function(aCommand, oMessage) {
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
    },

    /**
     * returns armor google spreadsheet
     * @param oMessage
     */
    getArmorSpreadsheetUrl: function(oMessage) {
        oMessage.reply("https://docs.google.com/spreadsheets/d/1lgLke5tI8LXWylHZnsmF5QTA2vdJGK6lz0N-oHm_3Ls/edit#gid=1065233840");
    }
};
