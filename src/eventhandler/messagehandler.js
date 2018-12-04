const oMhCalculator = require("../mhCalculator.js");
const oYoutubeHandler = require("../youtubeHandler.js");

/**
 * handler vor dispatching action triggered by discord.js message events
 * @type {{}}
 */
module.exports =
	{

		mCustomCommands: new Map(); // Map for saving dynamic generated commands

		executeCustomCommand: function (sCommand, oMessage)
		{
			oMessage.reply(mCustomCommands.get(sCommand));
		},

		addCustomCommand: function (aCommand, oMessage)
		{
			mCustomCommands.set(aCommand[0], aCommand[1]);
			oMessage.reply("Command: " + aCommand[0] + " added, type: !" + aCommand[0]);
		},

		isCustomCommand: function (sCommand)
		{
			return this.mCustomCommands.contains(sCommand);
		},

		clearCustomCommands: function ()
		{
			this.mCustomCommands = new Map();
		},

		/**
		 * 	 callse the requesthandler to search with the given query for the first matching youtube-video
		 * 	 and replies to the commanding user
		 *   @param aCommand
		 *   @param oMessage
		 */
		getYoutubeSearch: function (aCommand, oMessage, sApiKey)
		{
			oYoutubeHandler.youtubeSearchRequest(aCommand, sApiKey).then(
				function (oData)
				{
					oMessage.reply("https://www.youtube.com/watch?v=" + oData.id.videoId);
				},
				function (oError)
				{
					oMessage.reply("Error with" + ": " + oError.message);
				});
		},

		/**
		 *    bot joins the source voiceChannel
		 *    and plays the youtubelink using the ytdl-core library.
		 **/
		playYoutubeLink: function (sLink, oMessage, oClient)
		{
			if (sLink !== undefined)
			{
				if (!oMessage.member) return;
				if (!oMessage.member.voiceChannel) return;

				var oTargetChannel = oMessage.member.voiceChannel;

				// Play streams using ytdl-core
				var ytdl = require('ytdl-core');
				var broadcast = oClient.createVoiceBroadcast();
				var streamOptions = {seek: 0, volume: 1};

				oTargetChannel.join()
					.then(connection =>
					{
						var stream = ytdl(sLink, {filter: 'audioonly'});
						broadcast.playStream(stream, streamOptions);
						var dispatcher = connection.playBroadcast(broadcast);
					})
					.catch(console.error);
			}
		},

		/**
		 *    bot closes the voiceConnection and leaves the channel.
		 **/
		stopYoutubeLink: function (oClient)
		{
			const oConnection = oClient.voiceConnections.array()[0];
			oConnection.disconnect();
			oConnection.channel.leave();
		},

		/**
		 *    Responds with an embed message containing all the existing general commands
		 **/
		printHelpMessage: function (oMessage)
		{
			const oHelp = {name: "!help:", value: "Prints this message"};
			const oPlay = {name: "!play [youtubelink]", value: "Plays youtube video in current voice channel"};
			const oStop = {name: "!stop:", value: "Stops playback and leaves channel"};
			const oSearch = {name: "!youtubesearch [query ...]", value: "replies with the first matching youtube-video"};
			const oUptime = {name: "!uptime:", value: "Prints uptime"};
			const oMhHelp = {name: "!mhhelp", value: "Lists available commands for Monster Hunter Weapon calculation"};
			const oFooter = {text: "Please send known bugs to Hoppix#6723/k.hopfmann@hotmail.de"};

			const oEmbed =
				{
					embed: {
						color: 900000,
						description: "@Github: https://github.com/Hoppix/yami_bot_js",
						fields: [oHelp, oPlay, oStop, oSearch, oUptime, oMhHelp],
						footer: oFooter
					}
				};
			oMessage.reply(oEmbed);
		},

		/**
		 *    Responds with an embed message containting
		 *    all the available monster hunter world commands
		 **/
		printMhHelpMessage: function (oMessage)
		{
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

			const oSharpness = {name: "sharpness", value: "red, orange, yellow, green, blue, white, purple, gunner"};
			const oAttack = {name: "attack", value: "attack value as shown in game"};
			const oElemental = {name: "elemental", value: "elemental damage as shown in game (0 when none)"};
			const oAffinity = {name: "affinity", value: "a number between 0 and 100"};
			const oWeaponType = {
				name: "weapontype",
				value: "sns, ds, gs, ls, hm, hh, lc, gl, sa, cb, ig, bow, lbg, hbg"
			};

			const oFooter = {text: "Author: Hoppix#6723, Wolf#4328"};

			const oEmbed =
				{
					embed: {
						color: 900000,
						description: "Monster Hunter Calculation commands:",
						fields: [oWeaponStrength, oWeaponCompare, oMotionvalue, oKiranicoUrl, oArmorSets, oSharpness, oAttack, oAffinity, oElemental, oWeaponType],
						footer: oFooter
					}
				};
			oMessage.reply(oEmbed);
		},

		/**
		 * replies with a message containing the total uptime
		 **/
		printUptimeMessage: function (oUtility, oMessage, oStartedDate)
		{
			const oUptime = oUtility.uptimeSince(oStartedDate);
			oMessage.reply("Yami has been running for: " + oUptime.hours + " hours, " + oUptime.minutes + " minutes, and " + oUptime.seconds + " seconds.");
		},

		/**
		 *    receives the message and calculates the weapon Strength
		 *    using the mhCalculator
		 **/
		handleWeaponCalculation: function (aCommand, oMessage)
		{
			if (aCommand.length !== 5)
			{
				oMessage.reply("Wrong Parameters!");
				return;
			}
			const sWeaponStrength = oMhCalculator.mhCalculateWeaponStrength(aCommand[0], aCommand[1], aCommand[2], aCommand[3], aCommand[4]);

			if (typeof sWeaponStrength === "string")
			{
				oMessage.reply("Weapon Strength: " + sWeaponStrength);
				return;
			}
			oMessage.reply("Weapon Strength: " + sWeaponStrength.toFixed(1));
		},

		/**
		 *    receives the message and compares the weapon stength of
		 *    two weapons and compares them using the mhCalculator
		 **/
		handleWeaponCompare: function (aCommand, oMessage)
		{
			if (aCommand.length !== 9)
			{
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
		getWeaponMV: function (aCommand, oMessage)
		{
			if (aCommand.length !== 1)
			{
				oMessage.reply("Wrong Parameters!");
				return;
			}

			var sWeaponKey = aCommand[0].toUpperCase();
			var mWeaponMV = oMhCalculator.mhMvMapMap.get(sWeaponKey);

			if (mWeaponMV === undefined)
			{
				oMessage.reply("Invalid Weapontype!");
				return;
			}

			var aFields = [];

			for (key of mWeaponMV)
			{
				aFields.push({name: key[0], value: key[1].toString(), inline: true});
			}

			const oEmbed =
				{
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
		getKiranicoUrl: function (aCommand, oMessage)
		{
			var sUrl = "https://mhworld.kiranico.com";

			if (aCommand.length === 0)
			{
				oMessage.reply(sUrl);
			}
			else if (aCommand.length < 3)
			{
				for (var i = 0; i < aCommand.length; i++)
				{
					sUrl = sUrl + "/" + aCommand[i];
				}
				oMessage.reply(sUrl);
			}
			else
			{
				oMessage.reply("0-2 parameters required.");
			}
		},

		/**
		 * returns armor google spreadsheet
		 * @param oMessage
		 */
		getArmorSpreadsheetUrl: function (oMessage)
		{
			oMessage.reply("https://docs.google.com/spreadsheets/d/1lgLke5tI8LXWylHZnsmF5QTA2vdJGK6lz0N-oHm_3Ls/edit#gid=1065233840");
		}
	};
