import { Message, MessageMedia } from "../whatsapp/message";
import { ChatMessage, generateChatResponse, resolveAIConfig } from "../providers/ai";
import * as cli from "../cli/ui";
import config from "../config";

// TTS
import { ttsRequest as speechTTSRequest } from "../providers/speech";
import { ttsRequest as awsTTSRequest } from "../providers/aws";
import { TTSMode } from "../types/tts-mode";

// Moderation
import { moderateIncomingPrompt } from "./moderation";
import { getConfig } from "./ai-config";

// In-memory conversation history per chat
const conversations = new Map<string, ChatMessage[]>();

const trimHistory = (history: ChatMessage[]) => {
	const maxCharacters = Math.max(config.maxModelTokens * 4, 2000);
	let totalCharacters = history.reduce((total, message) => total + message.content.length, 0);

	while (totalCharacters > maxCharacters && history.length > 2) {
		// Keep the system prompt if present
		const index = history[0]?.role === "system" ? 1 : 0;
		totalCharacters -= history[index].content.length;
		history.splice(index, 1);
	}

	return history;
};

const handleMessageGPT = async (message: Message, prompt: string) => {
	try {
		cli.print(`[GPT] Received prompt from ${message.from}: ${prompt}`);

		// Prompt Moderation
		if (config.promptModerationEnabled) {
			try {
				await moderateIncomingPrompt(prompt);
			} catch (error: any) {
				await message.reply(error.message);
				return;
			}
		}

		const { providerName, model } = resolveAIConfig();
		const start = Date.now();

		let history = conversations.get(message.from);
		if (!history) {
			history = [];

			// Pre prompt
			if (config.prePrompt != null && config.prePrompt.trim() != "") {
				history.push({ role: "system", content: config.prePrompt.trim() });
			}

			cli.print(`[GPT] New conversation for ${message.from} (provider: ${providerName}, model: ${model})`);
		}

		history.push({ role: "user", content: prompt });

		const responseText = await generateChatResponse(history);
		history.push({ role: "assistant", content: responseText });
		conversations.set(message.from, trimHistory(history));

		const end = Date.now() - start;

		cli.print(`[GPT] Answer to ${message.from}: ${responseText}  | ${providerName} request took ${end}ms)`);

		// TTS reply (Default: disabled)
		if (getConfig("tts", "enabled")) {
			await sendVoiceMessageReply(message, responseText);
			await message.reply(responseText);
			return;
		}

		// Default: Text reply
		await message.reply(responseText);
	} catch (error: any) {
		console.error("An error occured", error);
		await message.reply("An error occured, please contact the administrator. (" + error.message + ")");
	}
};

const handleDeleteConversation = async (message: Message) => {
	// Delete conversation
	conversations.delete(message.from);

	// Reply
	await message.reply("Conversation context was resetted!");
};

async function sendVoiceMessageReply(message: Message, gptTextResponse: string) {
	let logTAG = "[TTS]";
	let mimetype = "audio/ogg; codecs=opus";
	let ttsRequest = async function (): Promise<Buffer | null> {
		return await speechTTSRequest(gptTextResponse);
	};

	switch (config.ttsMode) {
		case TTSMode.SpeechAPI:
			logTAG = "[SpeechAPI]";
			mimetype = "audio/ogg; codecs=opus";
			ttsRequest = async function (): Promise<Buffer | null> {
				return await speechTTSRequest(gptTextResponse);
			};
			break;

		case TTSMode.AWSPolly:
			logTAG = "[AWSPolly]";
			mimetype = "audio/mpeg";
			ttsRequest = async function (): Promise<Buffer | null> {
				return await awsTTSRequest(gptTextResponse);
			};
			break;

		default:
			logTAG = "[SpeechAPI]";
			mimetype = "audio/ogg; codecs=opus";
			ttsRequest = async function (): Promise<Buffer | null> {
				return await speechTTSRequest(gptTextResponse);
			};
			break;
	}

	// Get audio buffer
	cli.print(`${logTAG} Generating audio from GPT response "${gptTextResponse}"...`);
	const audioBuffer = await ttsRequest();

	// Check if audio buffer is valid
	if (audioBuffer == null || audioBuffer.length == 0) {
		message.reply(`${logTAG} couldn't generate audio, please contact the administrator.`);
		return;
	}

	cli.print(`${logTAG} Audio generated!`);

	// Send audio
	const messageMedia = new MessageMedia(mimetype, audioBuffer.toString("base64"));
	await message.reply(messageMedia);
}

export { handleMessageGPT, handleDeleteConversation };
