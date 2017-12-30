const oMhCalculator = require("../mhCalculator.js");

/**
 * handler vor dispatching action triggered by discord.js message events
 * @type {{}}
 */
module.exports =
	{
		playYoutubeLink: function (sLink, oMessage, oClient)
		{
			if (sLink !== undefined)
			{
				if (!oMessage.member) return;
				if (!oMessage.member.voiceChannel) return;

				var oTargetChannel = oMessage.member.voiceChannel;

				// Play streams using ytdl-core
				const ytdl = require('ytdl-core');
				const broadcast = oClient.createVoiceBroadcast();

				oTargetChannel.join()
					.then(connection =>
					{
						const stream = ytdl(sLink, {filter: 'audioonly'});
						broadcast.playStream(stream);
						const dispatcher = connection.playBroadcast(broadcast);
					})
					.catch(console.error);
			}
		},
		stopYoutubeLink: function (oClient)
		{
			const oConnection = oClient.voiceConnections.array()[0];
			oConnection.disconnect();
			oConnection.channel.leave();
		},
		printHelpMessage: function (oMessage)
		{
			const oHelp = {name: "!help:", value: "Prints this message"};
			const oPlay = {name: "!play youtubelink:", value: "Plays youtube video in current voice channel"};
			const oStop = {name: "!stop:", value: "Stops playback and leaves channel"};
			const oUptime = {name: "!uptime:", value: "Prints uptime"};
			const oMhHelp = {name: "!mhhelp", value: "Lists available commands for Monster Hunter Weapon calculation"};
			const oFooter = {text: "Author: Hoppix#6723"};

			const oEmbed =
				{
					embed: {
						color: 900000,
						description: "@Github: https://github.com/Hoppix/yami_bot_js",
						fields: [oHelp, oPlay, oStop, oUptime, oMhHelp],
						footer: oFooter
					}
				};
			oMessage.reply(oEmbed);
		},
		printMhHelpMessage: function (oMessage)
		{
			const oWeaponStrength = {
				name: "!mhwpnstr sharpness attack affinity elemental weapontype",
				value: "Calculates the true weapon strength for a certain weapon"
			};
			const oWeaponCompare = {
				name: "!mhwpncmp sharpness1 attack1 affinity1 elemental1 \n sharpness2 attack2 affinity2 elemental2 weapontype",
				value: "Calculates by how much percent a weapon outperforms the other"
			};
			const oSharpness = {name: "sharpness", value: "red, orange, yellow, green, blue, white, purple"};
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
						fields: [oWeaponStrength, oWeaponCompare, oSharpness, oAffinity, oWeaponType],
						footer: oFooter
					}
				};
			oMessage.reply(oEmbed);
		},
		printUptimeMessage: function (oUtility, oMessage, oStartedDate)
		{
			const oUptime = oUtility.uptimeSince(oStartedDate);
			oMessage.reply("Yami has been running for: " + oUptime.hours + " hours, " + oUptime.minutes + " minutes, and " + oUptime.seconds + " seconds.");
		},
		handleWeaponCalculation: function (aCommand, oMessage)
		{
			if (aCommand.length !== 5)
			{
				oMessage.reply("Wrong Parameters!");
				return;
			}
			const sWeaponStrength = oMhCalculator.mhCalculateWeaponStrength(aCommand[0], aCommand[1], aCommand[2], aCommand[3], aCommand[4]);

			if(typeof sWeaponStrength === "string")
			{
				oMessage.reply("Weapon Strength: " + sWeaponStrength);
				return;
			}
			oMessage.reply("Weapon Strength: " + sWeaponStrength.toFixed(1));
		},
		handleWeaponCompare: function (aCommand, oMessage)
		{
			if (aCommand.length !== 9)
			{
				oMessage.reply("Wrong Parameters!");
				return;
			}
			const oBetterWeapon = oMhCalculator.mhCompareWeapons(aCommand[0], aCommand[1], aCommand[2], aCommand[3], aCommand[4], aCommand[5], aCommand[6], aCommand[7], aCommand[8]);
			oMessage.reply(oBetterWeapon.weapon + " is better by " + ((oBetterWeapon.value*100).toFixed(1)) + "%");
		}
	};