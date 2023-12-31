import { TextChannel, MessageManager, Snowflake, Message, GuildMember } from "discord.js";

import { gameConfig } from "./gameConfig"

export class dataProvider {
    private config: gameConfig;
    private static MIN_WORD_COUNT: number = 5;
    private static UPPER_MSG_LIMIT: number = 4000;
    private static MAX_ITERATION_COUNT: number = 100;

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

        let messages: Array<Message> = await this.fetchAllMessages(manager);

        console.log("Fetched: " + messages.length);

        let filteredMessages: Array<Message> = messages.filter(message => this.isGameValid(message, gameMembers));
        return filteredMessages;
    }

    // visible for testing
    public isGameValid(message: any, members: Array<GuildMember>): boolean {

        let gameMessage = <Message>message;
        let messageText: String = gameMessage.content;

        if (!this.isFromGameMember(message, members)) {
            console.info("Message not from game member, exiting ...");
            return false;
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

    private async fetchAllMessages(manager: MessageManager): Promise<Array<Message>> {
        const allMessages: Array<Message> = [];
        let initialMessages = await manager.fetch({limit: 1});
        let lastMessage: Message | undefined = initialMessages.size === 1 ? initialMessages.at(0) : undefined;


        for (let iterationCount: number = 0; iterationCount < dataProvider.MAX_ITERATION_COUNT; iterationCount++) {
            if (!lastMessage) break;
            if (allMessages.length > dataProvider.UPPER_MSG_LIMIT) break;

            const page = await manager.fetch({ limit: 100, before: lastMessage.id });
            page.forEach(message => allMessages.push(message));
            lastMessage = page.at(-1);
        }

        return allMessages;
    }


}
