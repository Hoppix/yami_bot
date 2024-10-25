import { mock, instance, when } from "ts-mockito"
import { TextChannel, MessageManager, Snowflake, Message, GuildMember, User } from "discord.js";

import { dataProvider } from "../src/game/whoWroteIt/dataProvider";
import { gameConfig } from "../src/game/whoWroteIt/gameConfig";

const assert = require('assert');


describe('DataProviderTest', function () {
    it('Testing the data provider', function () {

        // given
        let gameChannel = mockEmptyGameChannel();

        let dataChannels: Array<TextChannel> = new Array();
        dataChannels.push(mockEmptyGameChannel());

        let memberA: GuildMember = mockGuildMemberWithName("sawano", "1337");
        let memberB: GuildMember = mockGuildMemberWithName("shinkai", "42");
        let memberC: GuildMember = mockGuildMemberWithName("hanazawa", "6969");

        let gameMembers: Array<GuildMember> = new Array();
        gameMembers.push(memberA);
        gameMembers.push(memberB);
        gameMembers.push(memberC);

        let config: gameConfig = new gameConfig(gameChannel, dataChannels, gameMembers);
        let provider: dataProvider = new dataProvider(config);


        let testMessage: Message = mockMessageWithContent("too short", "sawano", "1337");


        // when
        let result: boolean = provider.isGameValid(testMessage, gameMembers);

        // then
        assert.equal(result, false);


    });
});

function mockEmptyGameChannel(): TextChannel {
    let mockedChannel: TextChannel = mock(TextChannel)
    return instance(mockedChannel);
}

function mockMessageWithContent(messageContent: string, userName: string, userId: string): Message {

    // mock user
    let mockedUser: User = mock(User);

    when(mockedUser.username).thenReturn(userName);
    when(mockedUser.id).thenReturn(userId)

    let user: User = instance(mockedUser);

    // mock message
    let mockedMessage: Message = mock(Message);

    when(mockedMessage.content).thenReturn(messageContent);
    when(mockedMessage.author).thenReturn(user);

    return instance(mockedMessage) as Message;
}

function mockGuildMemberWithName(userName: string, userId: string): GuildMember {

    // mock user
    let mockedUser: User = mock(User);

    when(mockedUser.username).thenReturn(userName);
    when(mockedUser.id).thenReturn(userId);

    // mock guildmember
    let mockedGuildMember: GuildMember = mock(GuildMember);

    when(mockedGuildMember.id).thenReturn(userId)
    when(mockedGuildMember.user).thenReturn(instance(mockedUser))
    
    return instance(mockedGuildMember);
}
