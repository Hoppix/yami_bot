import { Message, ChannelType, TextChannel } from "discord.js";

import { game } from "./game"
import { gameConfig } from "./gameConfig"

class gameManager {

    games: Array<game>

    constructor() {
        this.games = new Array();
    }

    async newGame(message: any) {

        if(!message || !(message instanceof Message)) throw new Error("Message can't be null!");

        if(!message.guild || !message.channel || !(message.channel instanceof TextChannel)) {
            const errorMessage: string = "Must be a message from a guild text channel!"
            message.reply(errorMessage);
            throw new Error(errorMessage);
        }

        const gameMembers: Array<string> = this._getGameMembersFromMessage(message);
        const guildChannels: any = await message.guild.channels.fetch()
        const textGuildChannels: Array<TextChannel> = guildChannels.filter((c: any) => (c ? c.type === ChannelType.GuildText: false))
        const gameChannel: TextChannel = message.channel as TextChannel;

        const config: gameConfig = new gameConfig(gameChannel, textGuildChannels, gameMembers);
        let wwiGame: game = new game(config);

        await wwiGame.initialize();
        this.games.push(wwiGame);
    }

    guessForGame(message: any) {
        throw new Error("nyi");
    }

    _getGameMembersFromMessage(message: Message): Array<string> {
        // todo implement me
        throw new Error("nyi");
    }

    _finishGame(game: game) {
        throw new Error("nyi");
    }

 
}

module.exports.wwiGameManager = new gameManager();

