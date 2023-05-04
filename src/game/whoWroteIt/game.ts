import { TextChannel, Message } from "discord.js";

import { gameConfig } from "./gameConfig";
import { dataProvider } from "./dataProvider";

const utiliy = require("../../utility/utility");


export class game {
    id: string;
    config: gameConfig;
    dataProvider: dataProvider;
    messages: Array<Message>;
    answer: Message;
    isEnded: boolean

    constructor(config: gameConfig) {
        this.id = config.gameChannel.id;
        this.config = config;
        this.dataProvider = new dataProvider(config);
        this.messages = new Array();
        this.answer = {} as Message
        this.isEnded = false;
    }

    async initialize(): Promise<game> {
        this._gameOutput("Starting game with id: " + this.id);

        const membersPing: string = this.config.members.map(member => {
            return "@" + member;
        }).join(" - ");

        this._gameOutput("Loading game data for members: " + membersPing);
        this.messages = await this.dataProvider.createGameData()
        this._gameOutput("Created game data with : " + this.messages.length + " messages");
        return this;

    }

    start() {
        if (!this.messages || this.messages.length == 0) {
            let errorMessage: string = "Error: Game was not initialized with no messages!";
            this._gameOutput(errorMessage);
            throw new Error(errorMessage);
        }

        const randomMessage: Message = this.messages[Math.floor(Math.random() * this.messages.length)];
        this.answer = randomMessage;
        this._gameOutput("Who wrote this message at "
            + randomMessage.createdAt.toDateString
            + "?\n "
            + randomMessage.content)

    }

    guess(guessedMember: string): boolean {

        let correctMember = this.answer.author.username;
        this.isEnded = utiliy.isSameUserName(correctMember, guessedMember);

        if(this.isEnded) {
            this._gameOutput("Correct! " 
            + correctMember 
            + "wrote this at " 
            + this.answer.createdAt.toUTCString 
            + " in " 
            + "#" 
            + this.answer.channel);

        }

        return this.isEnded; 
    }

    _gameOutput(message: string) {
        // todo make this with fancy embeds
        let channel: TextChannel = this.config.gameChannel;

        if(!channel) {
            console.log("Channel not initialized!");
            return;
        }

        if(!message) {
            console.log("Message is empty!");
            return;
        }

        console.log(message)
        channel.send(message);
    }
}

