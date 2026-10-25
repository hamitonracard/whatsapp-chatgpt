# GPT + DALL-E + WhatsApp = AI Assistant 🚀

![Docker](https://github.com/askrella/whatsapp-chatgpt/actions/workflows/docker.yml/badge.svg)
![Prettier](https://github.com/askrella/whatsapp-chatgpt/actions/workflows/prettier.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Discord Invite](https://dcbadge.vercel.app/api/server/9VJaRXKwd3)](https://discord.gg/9VJaRXKwd3)

This WhatsApp bot connects through Baileys and answers with the AI provider of your choice: OpenAI, Anthropic (Claude), Google Gemini, Cerebras, OpenRouter, DeepSeek, Groq, xAI, Mistral, Ollama, or any OpenAI-compatible API.

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
