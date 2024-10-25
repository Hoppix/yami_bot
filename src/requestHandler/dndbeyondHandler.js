/**
 * @author hoppix
 */
const request = require("request-promise");
const cheerio = require("cheerio");

const requestConfig = {
  url: "http://www.dndbeyond.com/posts",
  headers: {
    // header fake to go around robots.txt
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
  },
};

const days = 7;

function scheduleDndBeyondEvent(oChatChannel) {
  /**
   * Repeated polling and scraping the dndbeyond posts
   */
  const iPollInterval = 12 * 60 * 60 * 1000; // every 12 hours, because cronjobs are too hard
  async function eventLoop() {
    let articles = await scrapeDndBeyondArticles(requestConfig);
    sendDiscordMessage(oChatChannel, articles);
  }

  setInterval(eventLoop, iPollInterval);
}

async function getNewPosts(oGuildMessage) {
  let articles = await scrapeDndBeyondArticles(requestConfig);
  oGuildMessage.reply(parseMessage(articles))
}

async function scrapeDndBeyondArticles(conf) {
  try {
    const html = await request.get(conf)
    const document = cheerio.load(html);
    const articlesElements = document("article");
  
    let articles = parseArticles(document, articlesElements);
    articles = filterArticlesByLastDays(days, articles);
  
    return articles;
  } catch (error) {
    console.log(error)
  }
  return [];
}

function parseArticles(dom, articleElements) {
  let articles = [];
  articleElements.each((index, element) => {
    let articleElement = dom(element).text().trim();
    const link = dom(element)[0].children[1].attribs.content; // href not found >_<
    let article = parseArticle(articleElement, link);
    articles.push(article);
  });
  return articles;
}
/**
 *
 * parse a single dom article element
 * @param {} articleElement
 */
function parseArticle(articleElement, link) {
  let articleList = articleElement.split("\n");
  articleList = articleList.filter((a) => a.trim() !== "");
  articleList = articleList.map((a) => a.trim());

  return {
    title: articleList[0],
    date: new Date(Date.parse(articleList[1])),
    author: articleList[3],
    description: articleList[4],
    link: link,
  };
}

function filterArticlesByLastDays(days, articles) {
  const today = Date.now();
  return articles.filter((article) => {
    const delta = today - article.date;
    const daysDiff = delta / (1000 * 60 * 60 * 24);
    if (daysDiff > days) {
      return false;
    }
    return true;
  });
}

function sendDiscordMessage(discordChannel, articles) {
  if (articles.length > 0) {
    const message = parseMessage(articles)

    if (discordChannel) {
      discordChannel.send(message);
    }
    console.info(message);
  }
}

function parseMessage(articles) {

  if(!articles[0]?.link) {
    return "I got blocked by DndBeyond.com";
  }

  let message =
    "Found new Posts on DnDBeyond for the last " +
    days +
    " days on " +
    new Date(Date.now()).toUTCString() +
    "\n";

  for (let i = 0; i < articles.length; i++) {
    message += articles[i].link + "\n";
  }
  return message;
}

/**
 * local testing
 */
if (require.main === module) {
  scheduleDndBeyondEvent(requestConfig);
}

// exports
module.exports.scheduleDndBeyondEvent = scheduleDndBeyondEvent;
module.exports.getNewPosts = getNewPosts;
