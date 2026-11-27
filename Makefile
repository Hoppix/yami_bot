start:
	uv run python src/bot.py

check:
	uv run pytest

lint:
	uv run ruff check src test
	uv run ruff format --check src test
