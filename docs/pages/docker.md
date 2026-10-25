# Docker

The bot runs without Chromium because it uses Baileys to connect to WhatsApp.

1. Create your environment file:

```sh
cp .env-example .env
```

2. Set `AI_PROVIDER` and the API key for your provider in `.env`.
3. Build and start the container:

```sh
docker compose up -d --build
```

4. Follow the logs and scan the QR code:

```sh
docker compose logs -f
```

The WhatsApp session is stored in the `session-data` volume, so logins survive container restarts and rebuilds.

To stop the bot:

```sh
docker compose down
```
