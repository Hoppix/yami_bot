/**
 * handler vor dispatching action triggered by discord.js presence updates
 * @type {{}}
 */
export function handleStatusUpdate(oUtility, newMember, _, oDefaultChannel) {
    const newPresence = newMember.presence.status;
    const sMessage = "User " + newMember.user.username + " went " + newPresence;

    console.log(sMessage);
    oDefaultChannel.send(sMessage);
    oUtility.writeLogFile(sMessage);
}
export function handleGameUpdate(oUtility, newMember, oldMember, oDefaultChannel) {
    if (newMember.presence.game === null || newMember.presence.game === undefined)
        return;
    const newPresence = newMember.presence.game.name;
    const sMessage = "User " + oldMember.user.username + " is now playing: " + newPresence;

    console.log(sMessage);
    oDefaultChannel.send(sMessage);
    oUtility.writeLogFile(sMessage);
}
