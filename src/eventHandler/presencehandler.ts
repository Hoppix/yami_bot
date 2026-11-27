import { Presence, SendableChannels } from "discord.js";
import utility from "../utility/utility";

/**
 * handler vor dispatching action triggered by discord.js presence updates
 */
const presenceHandler = {
    /**
     *	called when the user changes its online status.
     *	handles the logging and sends a message into the defaultGuildChannel
     **/
    handleStatusUpdate(oUtility: typeof utility, newPresence: Presence, oDefaultChannel: SendableChannels | undefined): void {
        const sMessage = "User " + newPresence.user?.username + " went " + newPresence.status;

        console.log(sMessage);
        oDefaultChannel?.send(sMessage);
        oUtility.writeLogFile(sMessage);
    },

    /**
     *	called when the user changes its game
     * handles the logging and sends a message into the defaultGuildChannel
     **/
    handleGameUpdate(oUtility: typeof utility, newPresence: Presence, oDefaultChannel: SendableChannels | undefined): void {
        const oActivity = newPresence.activities[0];
        if (!oActivity) return;
        const sMessage = "User " + newPresence.user?.username + " is now playing: " + oActivity.name;

        console.log(sMessage);
        oDefaultChannel?.send(sMessage);
        oUtility.writeLogFile(sMessage);
    },
};

export default presenceHandler;
