import { TextChannel, MessageManager, Snowflake, Message, GuildMember } from "discord.js";

import { gameConfig } from "./gameConfig"

export class dataProvider {
    private config: gameConfig;
    private static MIN_WORD_COUNT: number = 5;

    constructor(config: gameConfig) {
        this.config = config;
    }

    public async createGameData(): Promise<Array<Message>> {

        // todo for now only retrieve data from the main game channel, later get it from config.dataChannels
        let gameChannel: TextChannel = this.config.gameChannel;
        let gameMembers: Array<GuildMember> = this.config.members;
        let manager: MessageManager = gameChannel.messages;

        if (gameMembers.length < 1) {
            const errorMessage = "Needs atleast 2 members but was: " + gameMembers.length
            await gameChannel.send(errorMessage)

            throw new Error(errorMessage);
        }

        console.log("Loading message from " + gameChannel.name + " - " + gameMembers + " - " + manager);

        let messages: Map<Snowflake, Message> = await this.fetchAllMessages(manager);

        console.log("Fetched: " + messages.size);

        let filteredMessages: Array<Message> = Array.from(messages.values()).filter(message => this.isGameValid(message, gameMembers));
        return filteredMessages;
    }

    // visible for testing
    public isGameValid(message: any, members: Array<GuildMember>): boolean {

        let gameMessage = <Message>message;
        let messageText: String = gameMessage.content;

        if (!this.isFromGameMember(message, members)) {
            console.info("Message not from game member, exiting ...");
            return false
        };

        if (!(messageText.split(" ").length > dataProvider.MIN_WORD_COUNT)) {
            console.info("Message not long enough, exiting ...");
            return false;
        }

        if (messageText.includes("https://") || messageText.includes("http://")) {
            console.info("Message includes link, exiting ...");
            return false;
        }

        return true;
    }

    private isFromGameMember(message: Message, members: Array<GuildMember>): boolean {
        const authorId: string = message.author.id as string;
        const filteredById: Array<GuildMember> = members.filter(member => authorId === member.id);
        return filteredById.length === 1;
    }

    private async fetchAllMessages(manager: MessageManager): Promise<Map<Snowflake, Message>> {
        const initialMessages: Map<Snowflake, Message> = await manager.fetch({limit: 1});
        let lastMessage: Message = initialMessages.values().next().value // there can only be one element here

        console.info("Found message: ", lastMessage);

        while(lastMessage) {
            const page: Map<Snowflake, Message> = await manager.fetch({ limit: 100, before: lastMessage.id });
        }
        
        return new Map<Snowflake, Message>();
    }


}
