// CLI
import * as cli from "./cli/ui";

// Config
import { initAiConfig } from "./handlers/ai-config";
import { initOpenAI } from "./providers/openai";

// WhatsApp
import { startWhatsApp } from "./whatsapp/client";
import { handleIncomingMessage } from "./handlers/message";

// State
import { markBotReady } from "./state";

// Entrypoint
const start = async () => {
	cli.printIntro();

	// Register runtime commands before accepting messages
	initAiConfig();

	await startWhatsApp({
		onReady: async () => {
			try {
				initOpenAI();
				markBotReady();
				cli.printOutro();
			} catch (error: any) {
				cli.printError(`[OpenAI] Initialization failed: ${error?.message || error}`);
			}
		},
		onMessage: handleIncomingMessage
	});
};

start().catch((error) => {
	cli.printError(`[WhatsApp] Failed to start: ${error?.message || error}`);
	process.exit(1);
});
