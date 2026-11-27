from types import SimpleNamespace
from typing import Any

from game.who_wrote_it.data_provider import DataProvider
from game.who_wrote_it.game import Game
from game.who_wrote_it.game_config import GameConfig
from game.who_wrote_it.state import WwiState


def fake_member(user_name: str, user_id: int) -> Any:
    return SimpleNamespace(id=user_id, name=user_name)


def fake_message(content: str, author: Any) -> Any:
    return SimpleNamespace(content=content, author=author)


def create_provider(members: list[Any]) -> DataProvider:
    game_channel: Any = SimpleNamespace(id=1, name="game")
    return DataProvider(GameConfig(game_channel, [game_channel], members))


sawano = fake_member("sawano", 1337)
shinkai = fake_member("shinkai", 42)
hanazawa = fake_member("hanazawa", 6969)
game_members = [sawano, shinkai, hanazawa]


def test_too_short_message_is_invalid() -> None:
    provider = create_provider(game_members)
    assert not provider.is_game_valid(fake_message("too short", sawano), game_members)


def test_long_message_from_member_is_valid() -> None:
    provider = create_provider(game_members)
    assert provider.is_game_valid(fake_message("this message is long enough to be guessed", sawano), game_members)


def test_message_from_non_member_is_invalid() -> None:
    provider = create_provider(game_members)
    stranger = fake_member("stranger", 7)
    assert not provider.is_game_valid(fake_message("this message is long enough to be guessed", stranger), game_members)


def test_message_with_link_is_invalid() -> None:
    provider = create_provider(game_members)
    content = "look at this cool thing https://example.com it is great"
    assert not provider.is_game_valid(fake_message(content, sawano), game_members)


def create_guessing_game(answer_author: Any) -> Game:
    game_channel: Any = SimpleNamespace(id=1, name="game")
    game = Game(GameConfig(game_channel, [game_channel], game_members))
    game.answer = fake_message("this message is long enough to be guessed", answer_author)
    game.state = WwiState.GUESSING
    return game


def test_wrong_guess_keeps_the_game_running() -> None:
    game = create_guessing_game(sawano)
    assert not game.guess(shinkai.id)
    assert game.state == WwiState.GUESSING


def test_correct_guess_ends_the_game() -> None:
    game = create_guessing_game(sawano)
    assert game.guess(sawano.id)
    assert game.state == WwiState.ENDED
    assert not game.guess(sawano.id)
