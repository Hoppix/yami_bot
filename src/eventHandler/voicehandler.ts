import { SendableChannels, VoiceState } from "discord.js";
import utility from "../utility/utility";

/**
 * handler vor dispatching action triggered by discord.js voicestatus updates
 */
const voiceHandler = {
    /**
     *	called when a user enters/leaves/switches a channel
     * handles logging and sends a message to te defaultGuildChannel
     **/
    handleEventLogging(
        oUtility: typeof utility,
        oldVoiceState: VoiceState,
        newVoiceState: VoiceState,
        oDefaultChannel: SendableChannels | undefined
    ): void {
        const member = newVoiceState.member;
        if (!member) return;

        const oldChannel = oldVoiceState.channel;
        const newChannel = newVoiceState.channel;

        const sUsername = member.user.username;

        let sMessage: string;

        if (!oldChannel && newChannel) {
            //User joins a channel
            sMessage = "User: " + sUsername + " joined channel: " + newChannel.name;
        } else if (oldChannel && !newChannel) {
            //User leaves a channel
            sMessage = "User: " + sUsername + " left channel: " + oldChannel.name;
        } else if (oldChannel && newChannel) {
            //User switched a channel
            const sOldChannelName = oldChannel.name;
            const sNewChannelName = newChannel.name;
            if (sOldChannelName === sNewChannelName || !sOldChannelName || !sNewChannelName) return;
            sMessage = "User: " + sUsername + " switched from: " + sOldChannelName + " to: " + sNewChannelName;
        } else {
            //Nothing happened
            sMessage = "I logged an voiceStateUpdateEvent but nothing was triggered!";
        }
        console.log(sMessage);
        oDefaultChannel?.send(sMessage);
        oUtility.writeLogFile(sMessage);
    },
};

export default voiceHandler;
