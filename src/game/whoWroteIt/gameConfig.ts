
import { TextChannel } from "discord.js";

export class gameConfig {

    channel: TextChannel;
    members: Array<String>;

    constructor(channel : TextChannel, members: Array<String>) {
        this.channel = channel;
        this.members = members;
    }

}