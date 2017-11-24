/**
 * handler vor dispatching action triggered by discord.js voicestatus updates
 * @type {{}}
 */
module.exports =
	{
		handleEventLogging: function (oUtility, oldMember, newMember, oDefaultChannel)
		{
			var oldChannel = oldMember.voiceChannel;
			var newChannel = newMember.voiceChannel;

			var username = newMember.user.username;

			var newChannelName;
			var oldChannelName;
			var message;

			var time = oUtility.parseDateString() + " | ";

			if (!oldChannel && newChannel)
			{
				//User joins a channel
				newChannelName = newChannel.name;
				message = time + "User: " + username + " joined channel: " + newChannelName;

			}
			else if (oldChannel && !newChannel)
			{
				//User leaves a channel
				oldChannelName = oldChannel.name;
				message = time + "User: " + username + " left channel: " + oldChannelName;

			}
			else if (oldChannel && newChannel)
			{
				//User switched a channel
				oldChannelName = oldChannel.name;
				newChannelName = newChannel.name;
				if (oldChannelName === newChannelName || !oldChannelName || !newChannelName) return;
				message = time + "User: " + username + " switched from: " + oldChannelName + " to: " + newChannelName;
			}
			else
			{
				//Nothing happened
				message = "I logged an voiceStateUpdateEvent but nothing was triggered!"
			}
			console.log(message)
			oDefaultChannel.send(message);
			oUtility.writeLogFile(message);
		}
	}