# GPT + DALL-E + WhatsApp = AI Assistant 🚀

This project is unmaintained, looking for maintainers!

![Docker](https://github.com/askrella/whatsapp-chatgpt/actions/workflows/docker.yml/badge.svg)
![Prettier](https://github.com/askrella/whatsapp-chatgpt/actions/workflows/prettier.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This WhatsApp bot connects through [Baileys](https://github.com/WhiskeySockets/Baileys) and answers with the AI provider of your choice: OpenAI, Anthropic (Claude), Google Gemini, Cerebras, OpenRouter, DeepSeek, Groq, xAI, Mistral, Ollama, or any OpenAI-compatible API.

You can talk to the bot in voice messages, the bot will transcribe and respond. :robot:

<p align="center">
<img width="904" alt="Whatsapp ChatGPT" src="https://user-images.githubusercontent.com/6507938/220681521-17a12a41-44df-4d51-b491-f6a83871fc9e.png">
</p>

## Requirements

-   Node.js (20 or newer)
-   A recent version of npm
-   An API key for your chosen AI provider
-   An [OpenAI API key](https://platform.openai.com/account/api-keys) if you want DALL-E, Whisper, or prompt moderation
-   A WhatsApp account

## Supported AI providers

Set `AI_PROVIDER` and the matching API key. Use `AI_MODEL` to override the model and `AI_BASE_URL` for any custom OpenAI-compatible endpoint.

| Provider | `AI_PROVIDER` | API key variable | Example model |
| --- | --- | --- | --- |
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o-mini` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-5` |
| Google Gemini | `gemini` | `GEMINI_API_KEY` | `gemini-2.5-flash` |
| Cerebras | `cerebras` | `CEREBRAS_API_KEY` | `llama-3.3-70b` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` | `openai/gpt-4o-mini` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-chat` |
| Groq | `groq` | `GROQ_API_KEY` | `llama-3.3-70b-versatile` |
| xAI | `xai` | `XAI_API_KEY` | `grok-2-latest` |
| Mistral | `mistral` | `MISTRAL_API_KEY` | `mistral-large-latest` |
| Ollama | `ollama` | - | `llama3.2` |
| Custom | `custom` | `AI_API_KEY` | set `AI_MODEL` and `AI_BASE_URL` |

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
AI_MODEL=deepseek-chat
```

## Docker

```bash
cp .env-example .env
# edit .env with your provider and API key
docker compose up -d --build
docker compose logs -f
```

Scan the QR code printed in the logs, then the session is persisted in the `session-data` volume.

## Documentation

In the documentation you can find more information about how to install, configure and use this bot.

<span style="font-size: 1.4rem;">➡️ https://askrella.github.io/whatsapp-chatgpt</span>

## Disclaimer

The operations performed by this bot are not free. You will be charged by your AI provider for each request you make.

This bot uses Baileys, an unofficial WhatsApp Web library. No browser or Chromium instance is required.

NOTE: We can't guarantee that you won't be blocked using this method. WhatsApp does not allow bots or unofficial clients on its platform, so this should not be considered completely safe.

## Contributors

<a href="https://github.com/askrella/whatsapp-chatgpt/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=askrella/whatsapp-chatgpt" />
</a>

## Used libraries

-   https://github.com/WhiskeySockets/Baileys
-   https://github.com/openai/openai-node
-   https://github.com/langchain-ai/langchainjs
-   https://github.com/askrella/speech-rest-api
