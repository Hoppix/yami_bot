/**
 * handler vor dispatching action triggered by discord.js presence updates
 * @type {{}}
 */
module.exports =
	{
		handleStatusUpdate: function (oUtility, newMember, oldMember, oDefaultChannel)
		{
			const time = oUtility.parseDateString() + " | ";
			const newPresence = newMember.presence.status;
			const message = time + "User " + newMember.user.username + " went " + newPresence;

			console.log(message);
			oDefaultChannel.send(message);
			oUtility.writeLogFile(message);
		},
		handleGameUpdate: function (oUtility, newMember, oldMember, oDefaultChannel)
		{
			if (newMember.presence.game === null || newMember.presence.game === undefined) return;

			const time = oUtility.parseDateString() + " | ";
			const newPresence = newMember.presence.game.name;
			const message = time + "User " + oldMember.user.username + " is now playing: " + newPresence;

			console.log(message);
			oDefaultChannel.send(message);
			oUtility.writeLogFile(message);
		}
	}
