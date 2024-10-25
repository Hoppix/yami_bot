/**
 * handler vor dispatching action triggered by discord.js voicestatus updates
 * @type {{}}
 */
export function handleEventLogging(oUtility, oldVoiceState, newVoiceState, oDefaultChannel) {

    const member = newVoiceState.member;
    if (!member)
        return;

    var oldChannel = oldVoiceState.channel;
    var newChannel = newVoiceState.channel;

    var sUsername = member.user.username;

    var sNewChannelName;
    var sOldChannelName;
    var sMessage;

    if (!oldChannel && newChannel) {
        //User joins a channel
        sNewChannelName = newChannel.name;
        sMessage = "User: " + sUsername + " joined channel: " + sNewChannelName;
    } else if (oldChannel && !newChannel) {
        //User leaves a channel
        sOldChannelName = oldChannel.name;
        sMessage = "User: " + sUsername + " left channel: " + sOldChannelName;

    } else if (oldChannel && newChannel) {
        //User switched a channel
        sOldChannelName = oldChannel.name;
        sNewChannelName = newChannel.name;
        if (sOldChannelName === sNewChannelName || !sOldChannelName || !sNewChannelName)
            return;
        sMessage = "User: " + sUsername + " switched from: " + sOldChannelName + " to: " + sNewChannelName;
    } else {
        //Nothing happened
        sMessage = "I logged an voiceStateUpdateEvent but nothing was triggered!";
    }
    console.log(sMessage);
    oDefaultChannel.send(sMessage);
    oUtility.writeLogFile(sMessage);
}
