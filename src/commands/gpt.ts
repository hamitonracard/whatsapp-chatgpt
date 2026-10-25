import { ICommandModule, ICommandDefinition, ICommandsMap } from "../types/commands";
import { Message } from "../whatsapp/message";
import { config } from "../config";
import { AI_PROVIDERS, getAIProviderNames, isAIProvider, normalizeAIProvider } from "../providers/ai";
import { initOpenAI } from "../providers/openai";

export const GptModule: ICommandModule = {
	key: "gpt",
	register: (): ICommandsMap => {
		return {
			provider,
			model,
			apiKey,
			baseUrl,
			maxModelTokens
		};
	}
};

const provider: ICommandDefinition = {
	help: "<value> - Set the AI provider",
	hint: getAIProviderNames().join(", "),
	data: () => normalizeAIProvider(config.aiProvider),
	execute: function (message: Message, valueStr?: string) {
		const value = (valueStr || "").toLowerCase();
		if (!isAIProvider(value)) {
			message.reply(`Invalid provider, available providers are: ${getAIProviderNames().join(", ")}`);
			return;
		}

		config.aiProvider = normalizeAIProvider(value);
		config.aiModel = "";
		config.aiBaseUrl = "";
		message.reply(
			`Updated AI provider to ${AI_PROVIDERS[config.aiProvider].label}. Model reset to ${AI_PROVIDERS[config.aiProvider].defaultModel}.`
		);
	}
};

const model: ICommandDefinition = {
	help: "<value> - Set the AI model",
	hint: "gpt-4o-mini, claude-sonnet-4-5, gemini-2.5-flash, ...",
	data: () => config.aiModel || AI_PROVIDERS[normalizeAIProvider(config.aiProvider)]?.defaultModel || "",
	execute: function (message: Message, valueStr?: string) {
		if (!valueStr) {
			message.reply(`Invalid value, please give a model name.`);
			return;
		}

		config.aiModel = valueStr;
		message.reply(`Updated AI model to ${config.aiModel}`);
	}
};

const apiKey: ICommandDefinition = {
	help: "<value> - Set the API key for the active AI provider (comma-separated keys are supported for OpenAI)",
	hint: "sk-xxxx,sk-xxxx",
	data: () => {
		const provider = AI_PROVIDERS[normalizeAIProvider(config.aiProvider)];
		return config.aiApiKey || (provider?.apiKeyEnv ? process.env[provider.apiKeyEnv] : "") || "";
	},
	execute: function (message: Message, valueStr?: string) {
		if (!valueStr) {
			message.reply(`Invalid value, please give the API key for the active provider.`);
			return;
		}

		config.aiApiKey = valueStr;
		if (normalizeAIProvider(config.aiProvider) === "openai") {
			config.openAIAPIKeys = valueStr.split(",") as string[];
			initOpenAI();
		}

		message.reply(`Updated the API key for ${AI_PROVIDERS[normalizeAIProvider(config.aiProvider)]?.label || config.aiProvider}.`);
	}
};

const baseUrl: ICommandDefinition = {
	help: "<value> - Set a custom base URL for the active AI provider",
	hint: "https://api.openai.com/v1",
	data: () => config.aiBaseUrl || AI_PROVIDERS[normalizeAIProvider(config.aiProvider)]?.baseUrl || "",
	execute: function (message: Message, valueStr?: string) {
		if (!valueStr) {
			message.reply(`Invalid value, please give a base URL.`);
			return;
		}

		config.aiBaseUrl = valueStr;
		message.reply(`Updated AI base URL to ${config.aiBaseUrl}`);
	}
};

const maxModelTokens: ICommandDefinition = {
	help: "<value> - Set max model tokens value",
	hint: "integer",
	data: () => config.maxModelTokens,
	execute: function (message: Message, valueStr?: string) {
		const value = parseInt(valueStr || "");
		if (!value || isNaN(value)) {
			message.reply(`Invalid value, please give an integer value`);
			return;
		}

		config.maxModelTokens = value;
		message.reply(`Updated max model tokens to ${config.maxModelTokens}`);
	}
};
