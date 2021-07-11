/**
 * handler vor dispatching action triggered by discord.js presence updates
 * @type {{}}
 */
module.exports =
	{
		/**
		*	called when the user changes its online status.
		*	handles the logging and sends a message into the defaultGuildChannel
		**/
		handleStatusUpdate: function (oUtility, newMember, oldMember, oDefaultChannel)
		{
			const newPresence = newMember.presence.status;
			const sMessage = "User " + newMember.user.username + " went " + newPresence;

			console.log(sMessage);
			oDefaultChannel.send(sMessage);
			oUtility.writeLogFile(sMessage);
		},

		/**
		*	called when the user changes its game
		* handles the logging and sends a message into the defaultGuildChannel
		**/
		handleGameUpdate: function (oUtility, newMember, oldMember, oDefaultChannel)
		{
			if (newMember.presence.game === null || newMember.presence.game === undefined) return;
			const newPresence = newMember.presence.game.name;
			const sMessage = "User " + oldMember.user.username + " is now playing: " + newPresence;

			console.log(sMessage);
			oDefaultChannel.send(sMessage);
			oUtility.writeLogFile(sMessage);
		}
	}
