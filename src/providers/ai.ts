import OpenAI from "openai";

import config from "../config";

export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface AIProviderDefinition {
	label: string;
	baseUrl: string;
	apiKeyEnv: string;
	defaultModel: string;
	requiresApiKey: boolean;
	headers?: Record<string, string>;
}

export const AI_PROVIDERS: Record<string, AIProviderDefinition> = {
	openai: {
		label: "OpenAI",
		baseUrl: "https://api.openai.com/v1",
		apiKeyEnv: "OPENAI_API_KEY",
		defaultModel: "gpt-4o-mini",
		requiresApiKey: true
	},
	anthropic: {
		label: "Anthropic (Claude)",
		baseUrl: "https://api.anthropic.com",
		apiKeyEnv: "ANTHROPIC_API_KEY",
		defaultModel: "claude-sonnet-4-5",
		requiresApiKey: true
	},
	gemini: {
		label: "Google Gemini",
		baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
		apiKeyEnv: "GEMINI_API_KEY",
		defaultModel: "gemini-2.5-flash",
		requiresApiKey: true
	},
	cerebras: {
		label: "Cerebras",
		baseUrl: "https://api.cerebras.ai/v1",
		apiKeyEnv: "CEREBRAS_API_KEY",
		defaultModel: "llama-3.3-70b",
		requiresApiKey: true
	},
	openrouter: {
		label: "OpenRouter",
		baseUrl: "https://openrouter.ai/api/v1",
		apiKeyEnv: "OPENROUTER_API_KEY",
		defaultModel: "openai/gpt-4o-mini",
		requiresApiKey: true,
		headers: {
			"HTTP-Referer": "https://github.com/askrella/whatsapp-chatgpt",
			"X-Title": "whatsapp-chatgpt"
		}
	},
	deepseek: {
		label: "DeepSeek",
		baseUrl: "https://api.deepseek.com/v1",
		apiKeyEnv: "DEEPSEEK_API_KEY",
		defaultModel: "deepseek-chat",
		requiresApiKey: true
	},
	groq: {
		label: "Groq",
		baseUrl: "https://api.groq.com/openai/v1",
		apiKeyEnv: "GROQ_API_KEY",
		defaultModel: "llama-3.3-70b-versatile",
		requiresApiKey: true
	},
	xai: {
		label: "xAI (Grok)",
		baseUrl: "https://api.x.ai/v1",
		apiKeyEnv: "XAI_API_KEY",
		defaultModel: "grok-2-latest",
		requiresApiKey: true
	},
	mistral: {
		label: "Mistral",
		baseUrl: "https://api.mistral.ai/v1",
		apiKeyEnv: "MISTRAL_API_KEY",
		defaultModel: "mistral-large-latest",
		requiresApiKey: true
	},
	ollama: {
		label: "Ollama (local)",
		baseUrl: "http://localhost:11434/v1",
		apiKeyEnv: "",
		defaultModel: "llama3.2",
		requiresApiKey: false
	},
	custom: {
		label: "Custom OpenAI-compatible API",
		baseUrl: "",
		apiKeyEnv: "AI_API_KEY",
		defaultModel: "",
		requiresApiKey: false
	}
};

export const getAIProviderNames = () => Object.keys(AI_PROVIDERS);

const AI_PROVIDER_ALIASES: Record<string, string> = {
	claude: "anthropic",
	google: "gemini",
	"google-gemini": "gemini",
	"open-router": "openrouter",
	orcarouter: "openrouter",
	"x-ai": "xai",
	grok: "xai",
	local: "ollama"
};

export const normalizeAIProvider = (value: string) => {
	const provider = (value || "").toLowerCase();
	return AI_PROVIDER_ALIASES[provider] || provider;
};

export const isAIProvider = (value: string) => Object.prototype.hasOwnProperty.call(AI_PROVIDERS, normalizeAIProvider(value));

export interface ResolvedAIConfig {
	providerName: string;
	provider: AIProviderDefinition;
	apiKey: string;
	baseUrl: string;
	model: string;
	maxTokens: number;
}

export function resolveAIConfig(): ResolvedAIConfig {
	const providerName = normalizeAIProvider(config.aiProvider || "openai");
	const provider = AI_PROVIDERS[providerName] || AI_PROVIDERS.openai;

	const apiKey =
		config.aiApiKey ||
		(provider.apiKeyEnv ? process.env[provider.apiKeyEnv] : "") ||
		(providerName === "openai" ? config.openAIAPIKeys[0] : "") ||
		"";

	const baseUrl = (config.aiBaseUrl || provider.baseUrl).replace(/\/+$/, "");
	const model = config.aiModel || provider.defaultModel;

	if (!model) {
		throw new Error(`No model configured for provider "${providerName}". Set the AI_MODEL environment variable.`);
	}

	if (!baseUrl) {
		throw new Error(`No base URL configured for provider "${providerName}". Set the AI_BASE_URL environment variable.`);
	}

	if (provider.requiresApiKey && !apiKey) {
		throw new Error(
			`No API key configured for provider "${providerName}". Set AI_API_KEY or ${provider.apiKeyEnv || "the provider API key"} in your environment.`
		);
	}

	return { providerName, provider, apiKey, baseUrl, model, maxTokens: config.maxModelTokens };
}

export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
	const resolved = resolveAIConfig();

	if (resolved.providerName === "anthropic") {
		return generateAnthropicResponse(resolved, messages);
	}

	return generateOpenAICompatibleResponse(resolved, messages);
}

async function generateOpenAICompatibleResponse(resolved: ResolvedAIConfig, messages: ChatMessage[]): Promise<string> {
	const client = new OpenAI({
		apiKey: resolved.apiKey || "not-needed",
		baseURL: resolved.baseUrl,
		defaultHeaders: resolved.provider.headers,
		timeout: 120000
	});

	const completion = await client.chat.completions.create({
		model: resolved.model,
		messages,
		temperature: 0.7,
		top_p: 0.9,
		max_tokens: resolved.maxTokens
	});

	const text = completion.choices[0]?.message?.content;
	if (!text) {
		throw new Error(`The ${resolved.provider.label} API returned an empty response.`);
	}

	return text;
}

async function generateAnthropicResponse(resolved: ResolvedAIConfig, messages: ChatMessage[]): Promise<string> {
	const system = messages
		.filter((message) => message.role === "system")
		.map((message) => message.content)
		.join("\n\n");

	const anthropicMessages = messages
		.filter((message) => message.role !== "system")
		.map((message) => ({
			role: message.role === "assistant" ? "assistant" : "user",
			content: message.content
		}));

	const response = await fetch(`${resolved.baseUrl}/v1/messages`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-api-key": resolved.apiKey,
			"anthropic-version": "2023-06-01"
		},
		body: JSON.stringify({
			model: resolved.model,
			max_tokens: resolved.maxTokens,
			temperature: 0.7,
			system: system || undefined,
			messages: anthropicMessages
		})
	});

	if (!response.ok) {
		throw new Error(`The Anthropic API returned ${response.status}: ${await response.text()}`);
	}

	const data: any = await response.json();
	const text = (data.content || [])
		.filter((block: any) => block.type === "text")
		.map((block: any) => block.text)
		.join("\n");

	if (!text) {
		throw new Error("The Anthropic API returned an empty response.");
	}

	return text;
}
