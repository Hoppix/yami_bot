/**
 * handler vor dispatching action triggered by discord.js presence updates
 * @type {{}}
 */
module.exports =
	{
		handleStatusUpdate: function (oUtility, newMember, oldMember, oDefaultChannel)
		{
			const sTime = oUtility.parseDateString() + " | ";
			const newPresence = newMember.presence.status;
			const sMessage = sTime + "User " + newMember.user.username + " went " + newPresence;

			console.log(sMessage);
			oDefaultChannel.send(sMessage);
			oUtility.writeLogFile(sMessage);
		},
		handleGameUpdate: function (oUtility, newMember, oldMember, oDefaultChannel)
		{
			if (newMember.presence.game === null || newMember.presence.game === undefined) return;

			const sTime = oUtility.parseDateString() + " | ";
			const newPresence = newMember.presence.game.name;
			const sMessage = sTime + "User " + oldMember.user.username + " is now playing: " + newPresence;

			console.log(sMessage);
			oDefaultChannel.send(sMessage);
			oUtility.writeLogFile(sMessage);
		}
	}
