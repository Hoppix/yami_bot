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
			const oHelp = {name: "yami help:", value: "Prints this message"};
			const oPlay = {name: "yami play -youtubelink-:", value: "Plays youtube video in current voice channel"};
			const oStop = {name: "yami stop:", value: "Stops playback and leaves channel"};
			const oUptime = {name: "yami uptime:", value: "Prints uptime"};
			const oFooter = {text: "Author: Hoppix#6723"};

			const oEmbed =
				{
					embed: {
						color: 900000,
						description: "@Github: https://github.com/Hoppix/yami_bot_js",
						fields: [oHelp, oPlay, oStop, oUptime],
						footer: oFooter
					}
				}
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
			oMessage.reply("Weapon Strength: " + sWeaponStrength);
		},
		handleWeaponCompare: function (aCommand, oMessage)
		{
			if (aCommand.length !== 9)
			{
				oMessage.reply("Wrong Parameters!");
				return
			}
			
			const oBetterWeapon = oMhCalculator.mhCompareWeapons(aCommand[0], aCommand[1], aCommand[2], aCommand[3], aCommand[4], aCommand[5], aCommand[6], aCommand[7], aCommand[8]);
			
			if (typeof oBetterWeapon === "String")
			{
				oMessage.reply(oBetterWeapon);
				return
			}
			
			oMessage.reply(oBetterWeapon.weapon + " is better by " + (oBetterWeapon.value) + "%");
		}
	};