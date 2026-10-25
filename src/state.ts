// Timestamp from which incoming messages are processed
export let botReadyTimestamp: Date | null = null;

export const markBotReady = () => {
	botReadyTimestamp = new Date();
};
