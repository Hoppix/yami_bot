/**
 * handler vor dispatching action triggered by discord.js voicestatus updates
 * @type {{}}
 */
module.exports =
	{
		/**
		*	called when a user enters/leaves/switches a channel
		* handles logging and sends a message to te defaultGuildChannel
		**/
		handleEventLogging: function (oUtility, oldMember, newMember, oDefaultChannel)
		{
			var oldChannel = oldMember.voiceChannel;
			var newChannel = newMember.voiceChannel;

			var sUsername = newMember.user.username;

			var sNewChannelName;
			var sOldChannelName;
			var sMessage;

			if (!oldChannel && newChannel)
			{
				//User joins a channel
				sNewChannelName = newChannel.name;
				sMessage = "User: " + sUsername + " joined channel: " + sNewChannelName;
			}
			else if (oldChannel && !newChannel)
			{
				//User leaves a channel
				sOldChannelName = oldChannel.name;
				sMessage = "User: " + sUsername + " left channel: " + sOldChannelName;

			}
			else if (oldChannel && newChannel)
			{
				//User switched a channel
				sOldChannelName = oldChannel.name;
				sNewChannelName = newChannel.name;
				if (sOldChannelName === sNewChannelName || !sOldChannelName || !sNewChannelName) return;
				sMessage = "User: " + sUsername + " switched from: " + sOldChannelName + " to: " + sNewChannelName;
			}
			else
			{
				//Nothing happened
				sMessage = "I logged an voiceStateUpdateEvent but nothing was triggered!"
			}
			console.log(sMessage)
			oDefaultChannel.send(sMessage);
			oUtility.writeLogFile(sMessage);
		}
	}
