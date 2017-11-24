/**
 * handler vor dispatching action triggered by discord.js message events
 * @type {{}}
 */
module.exports =
	{
		playYoutubeLink: function (sLink)
		{
			if (sLink !== undefined)
			{
				if (!message.member) return;
				if (!message.member.voiceChannel) return;

				oTargetChannel = message.member.voiceChannel;

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
			const aConnections = oClient.voiceConnections.array();
			for (v in aConnections)
			{
				v.disconnect();
				v.channel.leave();
			}
		},
		printHelpMessage: function (oMessage)
		{
			const oHelp = {name: "yami help:", value: "Prints this message"};
			const oPlay = {name: "yami play -youtubelink-:", value: "Plays youtube video in current voice channel"};
			const oStop = {name: "yami stop:", value: "Stops playback and leaves channel"};
			const oFooter = {text: "Author: Hoppix#6723"};

			const oEmbed =
				{
					embed: {
						color: 900000,
						description: "@Github: https://github.com/Hoppix/yami_bot_js",
						fields: [oHelp, oPlay, oStop],
						footer: oFooter
					}
				}
			oMessage.reply(oEmbed);
		},
		printUptimeMessage: function (oUtility, oMessage, oStartedDate)
		{
			const oUptime = oUtility.uptimeSince(oStartedDate);
			oMessage.reply("Yami has been running for: " + oUptime.hours + " hours, " + oUptime.minutes + " minutes, and " + oUptime.seconds + " seconds.");
		}
	}