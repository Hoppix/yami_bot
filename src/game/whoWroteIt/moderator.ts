import { EmbedBuilder, TextChannel, GuildMember, APIEmbed, userMention, channelMention, Message } from "discord.js";

export class moderator {

    private static YAMI_URL: string = 'https://github.com/Hoppix/yami_bot';
    private static ICON_URL: string = 'https://puu.sh/JXUgh/a79259e7a7.png';
    private static YAMI_NAME: string = 'Yami';
    private static GAME_COLOR: number = 0x5d086e;
    private static ERROR_COLOR: number = 0x6e000b;

    private static GAME_TITLE: string = 'WhoWroteIt?'

    public static async sendDefaultGameMessage(content: string, targetChannel: TextChannel) {

        console.info(content);

        const embed: APIEmbed =  new EmbedBuilder()
            .setColor(moderator.GAME_COLOR)
            .setTitle(moderator.GAME_TITLE)
            .setAuthor({ name: moderator.YAMI_NAME, iconURL: moderator.ICON_URL, url: moderator.YAMI_URL })
            .setDescription(content)
            .setTimestamp()
            .setFooter({ text: moderator.YAMI_NAME, iconURL: moderator.ICON_URL })
            .toJSON();

        await targetChannel.send({embeds: [embed]});
    }

    public static async sendStartGameMessage(gameId: string, channel: TextChannel, members: Array<GuildMember>, targetChannel: TextChannel) {
        const memberMentions = members.map(member => userMention(member.id)).join(" ");
        const channelMentions = channelMention(channel.id);
        const content: string = `Starting game with members: ${memberMentions} in channel: ${channelMentions}`

        console.info(content);

        const embed: APIEmbed = new EmbedBuilder()
            .setColor(moderator.GAME_COLOR)
            .setTitle(moderator.GAME_TITLE)
            .setAuthor({ name: moderator.YAMI_NAME, iconURL: moderator.ICON_URL, url: moderator.YAMI_URL })
            .setDescription(content)
            .setTimestamp()
            .setFooter({ text: moderator.YAMI_NAME, iconURL: moderator.ICON_URL })
            .toJSON();
        
        await targetChannel.send({embeds: [embed]});
    }

    public static async sendFinishGameMessage(winner: GuildMember, answer: Message, channel: TextChannel, targetChannel: TextChannel) {
        const winnerMention = userMention(winner.id)
        const authorMention = userMention(answer.author.id)
        const channelMentions = channelMention(channel.id);
        const content: string = `Correct! ${authorMention} wrote this at ${answer.createdAt.toDateString()} in ${channelMentions}`

        console.info(content);

        const embed: APIEmbed =  new EmbedBuilder()
            .setColor(moderator.GAME_COLOR)
            .setTitle(moderator.GAME_TITLE)
            .setAuthor({ name: moderator.YAMI_NAME, iconURL: moderator.ICON_URL, url: moderator.YAMI_URL })
            .setDescription(content)
            .addFields({ name: 'Winner:', value: `${winnerMention}` })
            .setTimestamp()
            .setFooter({ text: moderator.YAMI_NAME, iconURL: moderator.ICON_URL })
            .toJSON();

        await targetChannel.send({embeds: [embed]}); 
    }

    public static async sendAbortGameMessage(targetChannel: TextChannel) {
        const content: string = `Game aborted!`

        console.error(content);

        const embed: APIEmbed =  new EmbedBuilder()
            .setColor(moderator.ERROR_COLOR)
            .setTitle(moderator.GAME_TITLE)
            .setAuthor({ name: moderator.YAMI_NAME, iconURL: moderator.ICON_URL, url: moderator.YAMI_URL })
            .setDescription(content)
            .setTimestamp()
            .setFooter({ text: moderator.YAMI_NAME, iconURL: moderator.ICON_URL })
            .toJSON();

        await targetChannel.send({embeds: [embed]});
    }

    
    public static async sendGameErrorMessage(content: string, targetChannel: TextChannel) {

        console.error(content);

        const embed: APIEmbed =  new EmbedBuilder()
            .setColor(moderator.ERROR_COLOR)
            .setTitle(moderator.GAME_TITLE)
            .setAuthor({ name: moderator.YAMI_NAME, iconURL: moderator.ICON_URL, url: moderator.YAMI_URL })
            .setDescription(content)
            .setTimestamp()
            .setFooter({ text: moderator.YAMI_NAME, iconURL: moderator.ICON_URL })
            .toJSON();

        await targetChannel.send({embeds: [embed]});
    }

}
