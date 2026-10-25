import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";
import { initializeAgentExecutor } from "langchain/agents";

import config from "../config";

export default class BrowserAgentProvider {
	fetch = async (query: string) => {
		const serpApiKey = process.env.SERPAPI_API_KEY;
		if (!serpApiKey) {
			throw new Error("The !lang command requires the SERPAPI_API_KEY environment variable");
		}

		// Always select highest probability word in search
		const model = new OpenAI({
			temperature: 0,
			openAIApiKey: process.env.OPENAI_API_KEY || config.openAIAPIKeys[0]
		});
		const tools = [new SerpAPI(serpApiKey)];

		const executor = await initializeAgentExecutor(tools, model, "zero-shot-react-description", true);
		const result = await executor.call({ input: query });

		return result.output;
	};
}
