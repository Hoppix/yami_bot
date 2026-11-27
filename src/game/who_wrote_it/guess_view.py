from collections.abc import Callable

import discord

from game.who_wrote_it.game import Game
from game.who_wrote_it.moderator import Moderator


class GuessButton(discord.ui.Button["GuessView"]):
    def __init__(self, member: discord.Member) -> None:
        super().__init__(label=member.display_name, style=discord.ButtonStyle.primary)
        self.member = member

    async def callback(self, interaction: discord.Interaction) -> None:
        assert self.view is not None
        await self.view.handle_guess(interaction, self.member)


class GuessView(discord.ui.View):
    def __init__(self, game: Game, on_end: Callable[[Game], None]) -> None:
        super().__init__(timeout=None)
        self.game = game
        self.on_end = on_end
        for member in game.config.members:
            self.add_item(GuessButton(member))

    def disable(self) -> None:
        for item in self.children:
            if isinstance(item, discord.ui.Button):
                item.disabled = True
        self.stop()

    async def handle_guess(self, interaction: discord.Interaction, member: discord.Member) -> None:
        if not self.game.guess(member.id):
            await interaction.response.send_message(f"Nope, it was not {member.display_name}", ephemeral=True)
            return

        self.disable()
        self.on_end(self.game)
        await interaction.response.edit_message(view=self)

        answer = self.game.answer
        channel = self.game.config.game_channel
        if answer is not None:
            await Moderator.send_finish_game_message(interaction.user, answer, channel, channel)
