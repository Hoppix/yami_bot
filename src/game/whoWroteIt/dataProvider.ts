import { TextChannel, MessageManager, Snowflake, Message } from "discord.js";

import { gameConfig } from "./gameConfig"

export class dataProvider {
    config: gameConfig;
    MIN_WORD_COUNT: number = 5;

    constructor(config: gameConfig) {
        this.config = config;
    }

    async createGameData(): Promise<Array<Message>> {

        // for now only retrieve data from the main game channel, later get it from config.dataChannels
        let gameChannel: TextChannel = this.config.gameChannel;
        let gameMembers: Array<String> = this.config.members;
        let manager: MessageManager = gameChannel.messages;

        let messages: Map<Snowflake, Message> = await manager.fetch();

        let filteredMessages: Array<Message> = Array.from(messages.values()).filter(message => this._isGameValid(message, gameMembers));
        return filteredMessages;

    }

    _isGameValid(message: any, members: Array<String>): boolean {
        if(!(message instanceof Message)) return false;

        let gameMessage = <Message> message;
        let authorName: String = gameMessage.author.username;
        let messageText: String = gameMessage.content;

        if(!members.includes(authorName)) return false;

        if(!(messageText.split(" ").length > this.MIN_WORD_COUNT)) return false;

        if(messageText.includes("https://")) return false;
        if(messageText.includes("http://")) return false;

        return true;
    }
}