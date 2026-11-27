from types import SimpleNamespace
from typing import Any

from game.whoWroteIt.dataProvider import dataProvider
from game.whoWroteIt.gameConfig import gameConfig


def fakeMember(userName: str, userId: int) -> Any:
    return SimpleNamespace(id=userId, name=userName)


def fakeMessage(content: str, author: Any) -> Any:
    return SimpleNamespace(content=content, author=author)


def createProvider(members: list[Any]) -> dataProvider:
    gameChannel: Any = SimpleNamespace(id=1, name="game")
    return dataProvider(gameConfig(gameChannel, [gameChannel], members))


sawano = fakeMember("sawano", 1337)
shinkai = fakeMember("shinkai", 42)
hanazawa = fakeMember("hanazawa", 6969)
gameMembers = [sawano, shinkai, hanazawa]


def test_tooShortMessageIsInvalid() -> None:
    provider = createProvider(gameMembers)
    assert not provider.isGameValid(fakeMessage("too short", sawano), gameMembers)


def test_longMessageFromMemberIsValid() -> None:
    provider = createProvider(gameMembers)
    assert provider.isGameValid(fakeMessage("this message is long enough to be guessed", sawano), gameMembers)


def test_messageFromNonMemberIsInvalid() -> None:
    provider = createProvider(gameMembers)
    stranger = fakeMember("stranger", 7)
    assert not provider.isGameValid(fakeMessage("this message is long enough to be guessed", stranger), gameMembers)


def test_messageWithLinkIsInvalid() -> None:
    provider = createProvider(gameMembers)
    content = "look at this cool thing https://example.com it is great"
    assert not provider.isGameValid(fakeMessage(content, sawano), gameMembers)
