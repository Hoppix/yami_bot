/**
 * @author hoppix
 */
import * as cheerio from "cheerio";
import { Message, SendableChannels } from "discord.js";

interface RequestConfig {
    url: string;
    headers: Record<string, string>;
}

interface Article {
    title: string;
    date: Date;
    author: string;
    description: string;
    link: string | undefined;
}

const requestConfig: RequestConfig = {
    url: "http://www.dndbeyond.com/posts",
    headers: {
        // header fake to go around robots.txt
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    },
};

const days = 7;

export function scheduleDndBeyondEvent(oChatChannel?: SendableChannels): void {
    /**
     * Repeated polling and scraping the dndbeyond posts
     */
    const iPollInterval = 12 * 60 * 60 * 1000; // every 12 hours, because cronjobs are too hard
    async function eventLoop() {
        const articles = await scrapeDndBeyondArticles(requestConfig);
        sendDiscordMessage(oChatChannel, articles);
    }

    setInterval(eventLoop, iPollInterval);
}

export async function getNewPosts(oGuildMessage: Message): Promise<void> {
    const articles = await scrapeDndBeyondArticles(requestConfig);
    oGuildMessage.reply(parseMessage(articles));
}

async function scrapeDndBeyondArticles(conf: RequestConfig): Promise<Article[]> {
    try {
        const response = await fetch(conf.url, { headers: conf.headers });
        const html = await response.text();
        const document = cheerio.load(html);
        const articlesElements = document("article");

        let articles = parseArticles(document, articlesElements);
        articles = filterArticlesByLastDays(days, articles);

        return articles;
    } catch (error) {
        console.log(error);
    }
    return [];
}

function parseArticles(dom: cheerio.CheerioAPI, articleElements: ReturnType<cheerio.CheerioAPI>): Article[] {
    const articles: Article[] = [];
    articleElements.each((_index, element) => {
        const articleElement = dom(element).text().trim();
        const linkNode = "children" in element ? element.children[1] : undefined; // href not found >_<
        const link = linkNode && "attribs" in linkNode ? linkNode.attribs.content : undefined;
        articles.push(parseArticle(articleElement, link));
    });
    return articles;
}

/**
 * parse a single dom article element
 */
function parseArticle(articleElement: string, link: string | undefined): Article {
    const articleList = articleElement
        .split("\n")
        .filter((a) => a.trim() !== "")
        .map((a) => a.trim());

    return {
        title: articleList[0],
        date: new Date(Date.parse(articleList[1])),
        author: articleList[3],
        description: articleList[4],
        link: link,
    };
}

function filterArticlesByLastDays(days: number, articles: Article[]): Article[] {
    const today = Date.now();
    return articles.filter((article) => {
        const delta = today - article.date.getTime();
        const daysDiff = delta / (1000 * 60 * 60 * 24);
        return daysDiff <= days;
    });
}

function sendDiscordMessage(discordChannel: SendableChannels | undefined, articles: Article[]): void {
    if (articles.length > 0) {
        const message = parseMessage(articles);

        if (discordChannel) {
            discordChannel.send(message);
        }
        console.info(message);
    }
}

function parseMessage(articles: Article[]): string {
    if (!articles[0]?.link) {
        return "I got blocked by DndBeyond.com";
    }

    let message =
        "Found new Posts on DnDBeyond for the last " + days + " days on " + new Date(Date.now()).toUTCString() + "\n";

    for (const article of articles) {
        message += article.link + "\n";
    }
    return message;
}

/**
 * local testing
 */
if (require.main === module) {
    scheduleDndBeyondEvent();
}
