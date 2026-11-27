import os


class Config:
    """server setup, the token comes from the environment (.env)"""

    discord_token = os.environ.get("DISCORDTOKEN", "")

    default_guild_id = 203989186397601792
    default_channel_id = 307629566938054656
    play_message = "Type: /help"
    start_message = "Yami: fully vibed!"
    custom_commands_path = "/tmp/yami/commands/custom.json"
    log_file_path = "/tmp/yami/logs/log.txt"
    healthcheck_port = 8080
    healthcheck_path = "/actuator/health"


CONFIG = Config()
