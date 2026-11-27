from datetime import UTC, datetime, timedelta

from request_handler.dndbeyond_handler import Article, filter_articles_by_last_days, unseen_articles


def article(link: str | None, days_ago: int = 0) -> Article:
    return Article("title", datetime.now(UTC) - timedelta(days=days_ago), "author", "description", link)


def test_unseen_articles_skips_posted_links() -> None:
    articles = [article("a"), article("b"), article(None)]
    assert [new.link for new in unseen_articles(articles, {"a"})] == ["b"]


def test_old_articles_are_filtered() -> None:
    articles = [article("new", days_ago=1), article("old", days_ago=30)]
    assert [recent.link for recent in filter_articles_by_last_days(7, articles)] == ["new"]
