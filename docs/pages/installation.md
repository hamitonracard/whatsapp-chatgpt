# Installation

1. Clone this repository
2. Install the required packages by running `npm install`
3. Create a `.env` file from `.env-example`
    - Example file: [.env-example](https://github.com/askrella/whatsapp-chatgpt/blob/master/.env-example)
    - Set `AI_PROVIDER` and the API key for that provider (for example `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`)
    - An OpenAI key is only required for DALL-E, Whisper transcription, and prompt moderation
4. Run the bot using `npm run start`
5. Scan the QR code with WhatsApp (link a device)
6. Now you're ready to go! People can send you messages, and the bot will respond to them

The WhatsApp session is written to `SESSION_PATH` (default: `./session`). Keep that folder between restarts so you don't have to scan the QR code again.
