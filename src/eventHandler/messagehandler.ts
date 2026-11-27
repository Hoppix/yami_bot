import { APIEmbedField, Message } from "discord.js";
import oMhCalculatorManager from "../mh/mhCalculatorManager";
import { youtubeSearchRequest, YoutubeSearchError } from "../requestHandler/youtubeHandler";
import utility from "../utility/utility";
import oConfig from "../../resources/config.json";

const sCommandsFile: string = oConfig.customCommandsPath;

/**
 * handler vor dispatching action triggered by discord.js message events
 */
const messageHandler = {
    mCustomCommands: new Map<string, string>(), // Map for saving dynamic generated commands

    /**
     *    runs a command saved in the command map
     */
    executeCustomCommand(sCommand: string, oMessage: Message): void {
        this.updateCommandMap();
        const sReply = this.mCustomCommands.get(sCommand.toLowerCase());
        if (sReply) oMessage.reply(sReply);
    },

    /**
     * adds a command to the command map
     */
    addCustomCommand(aCommand: string[], oMessage: Message): void {
        let s = "";

        for (let i = 1; i < aCommand.length; i++) {
            s += aCommand[i] + " ";
        }

        if (!aCommand[0] || !s) {
            oMessage.reply("Must contain valid message!");
            return;
        }

        const sCommand = aCommand[0].toLowerCase();
        this.mCustomCommands.set(sCommand, s);
        this.saveCommands();
        oMessage.reply("Command: " + sCommand + " added, type: !" + sCommand);
    },

    /**
     * delete a comnmand from the command map, identified by the command key
     */
    deleteCustomCommand(aCommand: string[], oMessage: Message): void {
        this.updateCommandMap();
        this.mCustomCommands.delete(aCommand[0]?.toLowerCase());
        this.saveCommands();
        oMessage.reply("Command: " + aCommand[0] + " deleted!");
    },

    printCustomCommands(oMessage: Message): void {
        const commands: APIEmbedField[] = [];
        this.updateCommandMap();
        this.mCustomCommands.forEach((_value, key) => {
            commands.push({
                name: key,
                value: "##################",
            });
        });

        oMessage.reply({
            embeds: [
                {
                    color: 900000,
                    description: "Saved custom commands:",
                    fields: commands,
                },
            ],
        });
    },

    /**
     * checks if sCommand is a custom command
     */
    isCustomCommand(sCommand: string): boolean {
        this.updateCommandMap();
        return this.mCustomCommands.has(sCommand.toLowerCase());
    },

    /**
     * saves the @mCustomCommands map to the persistence file
     */
    saveCommands(): void {
        utility.writeJSONFile(sCommandsFile, this.mCustomCommands);
    },

    /**
     * updates the command map from the persistence file.
     * keys are lowercased so commands saved before matching became case-insensitive still work
     */
    updateCommandMap(): void {
        const mStored = utility.readJSONFile<string, string>(sCommandsFile);
        this.mCustomCommands = new Map([...mStored].map(([sKey, sValue]) => [sKey.toLowerCase(), sValue]));
    },

    /**
     * adds a role to the user, if the user has the rights for this role
     */
    async addRoleToUser(sRoleName: string, oMessage: Message): Promise<void> {
        const oGuild = oMessage.guild;

        if (!oGuild) {
            oMessage.reply("Could not determine the server to add the role!");
            return;
        }

        const oGuildMember = await oGuild.members.fetch(oMessage.author.id);

        const oGuildRolesManager = oGuild.roles;
        const oUserRoleManager = oGuildMember.roles;
        const oHighestRole = oUserRoleManager.highest;

        console.log("search ", sRoleName);

        // Fetch all roles from the guild
        const aRoles = await oGuildRolesManager.fetch();
        const oRoleDesired = aRoles.find((r) => r.name.toLowerCase() === sRoleName.toLowerCase());

        if (!oRoleDesired) {
            oMessage.reply("Could not find the given role");
            return;
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
            utility.writeLogFile("Error ocurred when adding a role: " + error);
        });
        oMessage.reply(oGuildMember.displayName + " now has role " + oRoleDesired.name);
    },

    /**
     *     calls the requesthandler to search with the given query for the first matching youtube-video
     *     and replies to the commanding user
     */
    getYoutubeSearch(aCommand: string[], oMessage: Message, sApiKey: string): void {
        youtubeSearchRequest(aCommand, sApiKey).then(
            (oData) => {
                if (oData.id?.videoId) {
                    oMessage.reply("https://www.youtube.com/watch?v=" + oData.id.videoId);
                    return;
                }

                if (oData.id?.channelId) {
                    oMessage.reply("https://www.youtube.com/channel/" + oData.id.channelId);
                    return;
                }
            },
            (oError: YoutubeSearchError) => {
                oMessage.reply("Error with" + ": " + oError.message);
            }
        );
    },

    /**
     *    Responds with an embed message containing all the existing general commands
     **/
    printHelpMessage(oMessage: Message): void {
        const aFields: APIEmbedField[] = [
            { name: "!help", value: "Prints this message" },
            { name: "!play [youtubelink]", value: "Plays youtube video in current voice channel" },
            { name: "!stop", value: "Stops playback and leaves channel" },
            { name: "!youtubesearch [query ...]", value: "replies with the first matching youtube-video" },
            { name: "!addcustom [commandname] [text ...]", value: "creates a custom command which replies with the given text" },
            { name: "!deletecustom [commandname]", value: "Deletes a single command identified by the commandname" },
            { name: "!showcustom", value: "prints all saved custom commands" },
            { name: "!uptime:", value: "Prints uptime" },
            { name: "!mhhelp", value: "Lists available commands for Monster Hunter Weapon calculation" },
            { name: "!giverole", value: "Adds you to the given usergroup if you have the rights." },
        ];

        oMessage.reply({
            embeds: [
                {
                    color: 900000,
                    description: "@Github: https://github.com/Hoppix/yami_bot_js",
                    fields: aFields,
                    footer: { text: "Please send known bugs to Hoppix#6723/k.hopfmann@hotmail.de" },
                },
            ],
        });
    },

    /**
     *    Responds with an embed message containting
     *    all the available monster hunter world commands
     **/
    printMhHelpMessage(oMessage: Message): void {
        const aFields: APIEmbedField[] = [
            {
                name: "!weaponstrength [sharpness] [attack] [affinity] [elemental] [weapontype]",
                value: "Calculates the true weapon strength for a certain weapon",
            },
            {
                name: "!weaponcompare [sharpness1] [attack1] [affinity1] [elemental1] [sharpness2] [attack2] [affinity2] [elemental2] [weapontype]",
                value: "Calculates by how much percent a weapon outperforms the other",
            },
            { name: "!motionvalues [weapontype]", value: "Lists all the Motionvalues for every specific attack" },
            {
                name: "!kiranico [category] [object]",
                value: "Generates a kiranico link from the parameters. Example: !kiranico monster, !kiranico item potion",
            },
            { name: "!armorsets", value: "link to a google spreadsheet file" },
            { name: "sharpness", value: "red, orange, yellow, green, blue, white, purple, gunner" },
            { name: "attack", value: "attack value as shown in game" },
            { name: "affinity", value: "a number between 0 and 100" },
            { name: "elemental", value: "elemental damage as shown in game (0 when none)" },
            { name: "weapontype", value: "sns, ds, gs, ls, hm, hh, lc, gl, sa, cb, ig, bow, lbg, hbg" },
        ];

        oMessage.reply({
            embeds: [
                {
                    color: 900000,
                    description: "Monster Hunter Calculation commands:",
                    fields: aFields,
                    footer: { text: "Author: Hoppix#6723, Wolf#4328" },
                },
            ],
        });
    },

    /**
     * replies with a message containing the total uptime
     **/
    printUptimeMessage(oUtility: typeof utility, oMessage: Message, oStartedDate: Date): void {
        const oUptime = oUtility.uptimeSince(oStartedDate);
        oMessage.reply(
            "Yami has been running for: " + oUptime.hours + " hours, " + oUptime.minutes + " minutes, and " + oUptime.seconds + " seconds."
        );
    },

    /**
     *    receives the message and calculates the weapon Strength
     *    using the mhCalculator
     **/
    handleWeaponCalculation(aCommand: string[], oMessage: Message): void {
        if (aCommand.length !== 5) {
            oMessage.reply("Wrong Parameters!");
            return;
        }
        const sWeaponStrength = oMhCalculatorManager
            .get()
            .calculateWeaponStrength(aCommand[0], Number(aCommand[1]), Number(aCommand[2]), Number(aCommand[3]), aCommand[4]);

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
    handleWeaponCompare(aCommand: string[], oMessage: Message): void {
        if (aCommand.length !== 9) {
            oMessage.reply("Wrong Parameters!");
            return;
        }
        const oBetterWeapon = oMhCalculatorManager
            .get()
            .compareWeaponStrength(
                aCommand[0],
                Number(aCommand[1]),
                Number(aCommand[2]),
                Number(aCommand[3]),
                aCommand[4],
                Number(aCommand[5]),
                Number(aCommand[6]),
                Number(aCommand[7]),
                aCommand[8]
            );
        oMessage.reply(oBetterWeapon.weapon + " is better by " + (oBetterWeapon.value * 100).toFixed(1) + "%");
    },

    /**
     *    receives the message and responds with an embed containing all
     *    the motionvalues for a specified weapon using the mhCalculator
     **/
    getWeaponMV(aCommand: string[], oMessage: Message): void {
        if (aCommand.length !== 1) {
            oMessage.reply("Wrong Parameters!");
            return;
        }

        const sWeaponKey = aCommand[0].toUpperCase();
        const mWeaponMV = oMhCalculatorManager.get().mhMvMapMap.get(sWeaponKey);

        if (mWeaponMV === undefined) {
            oMessage.reply("Invalid Weapontype!");
            return;
        }

        const aFields: APIEmbedField[] = [];

        for (const [sMove, aHits] of mWeaponMV) {
            aFields.push({
                name: sMove,
                value: aHits.toString(),
                inline: true,
            });
        }

        oMessage.reply({
            embeds: [
                {
                    color: 900000,
                    title: "Motionvalues for " + sWeaponKey + ":",
                    fields: aFields,
                },
            ],
        });
    },

    /**
     * responds with a kiranico url generated by params
     */
    getKiranicoUrl(aCommand: string[], oMessage: Message): void {
        let sUrl = "https://mhworld.kiranico.com";

        if (aCommand.length === 0) {
            oMessage.reply(sUrl);
        } else if (aCommand.length < 3) {
            for (const sPart of aCommand) {
                sUrl = sUrl + "/" + sPart;
            }
            oMessage.reply(sUrl);
        } else {
            oMessage.reply("0-2 parameters required.");
        }
    },

    /**
     * returns armor google spreadsheet
     */
    getArmorSpreadsheetUrl(oMessage: Message): void {
        oMessage.reply("https://docs.google.com/spreadsheets/d/1lgLke5tI8LXWylHZnsmF5QTA2vdJGK6lz0N-oHm_3Ls/edit#gid=1065233840");
    },
};

export default messageHandler;
