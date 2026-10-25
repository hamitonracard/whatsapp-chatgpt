import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import { downloadMediaMessage, getContentType, isJidGroup, jidNormalizedUser } from "@whiskeysockets/baileys";
import * as cli from "../cli/ui";

const MEDIA_CONTENT_TYPES = ["imageMessage", "videoMessage", "audioMessage", "documentMessage", "stickerMessage"];

// IDs of messages sent by the bot, used to avoid answering our own messages
const sentMessageIds = new Set<string>();

export const wasSentByBot = (id?: string | null) => !!id && sentMessageIds.has(id);

export class MessageMedia {
	constructor(
		public mimetype: string,
		public data: string,
		public filename?: string
	) {}
}

export class Message {
	constructor(
		private readonly sock: WASocket,
		public readonly raw: WAMessage,
		public readonly id: string | null | undefined,
		public readonly from: string,
		public readonly to: string,
		public readonly fromMe: boolean,
		public readonly body: string,
		public readonly timestamp: number | null,
		public readonly hasQuotedMsg: boolean,
		public readonly hasMedia: boolean,
		public readonly isGroup: boolean,
		private readonly mediaMimetype: string | null,
		private readonly mediaFilename: string | null
	) {}

	async reply(content: string | MessageMedia) {
		const jid = this.from;

		if (typeof content === "string") {
			const sent = await this.sock.sendMessage(jid, { text: content }, { quoted: this.raw });
			if (sent?.key?.id) sentMessageIds.add(sent.key.id);
			return sent;
		}

		const buffer = Buffer.from(content.data, "base64");
		const mimetype = content.mimetype;
		const options = { quoted: this.raw };

		let sent;
		if (mimetype.startsWith("audio/")) {
			const isVoiceNote = mimetype.includes("ogg");
			sent = await this.sock.sendMessage(jid, { audio: buffer, mimetype, ptt: isVoiceNote }, options);
		} else if (mimetype.startsWith("image/")) {
			sent = await this.sock.sendMessage(jid, { image: buffer, mimetype }, options);
		} else {
			sent = await this.sock.sendMessage(jid, { document: buffer, mimetype, fileName: content.filename || "file" }, options);
		}

		if (sent?.key?.id) sentMessageIds.add(sent.key.id);
		return sent;
	}

	async downloadMedia(): Promise<MessageMedia | null> {
		if (!this.hasMedia) return null;

		try {
			const buffer = (await downloadMediaMessage(this.raw, "buffer", {})) as Buffer;
			return new MessageMedia(
				this.mediaMimetype || "application/octet-stream",
				buffer.toString("base64"),
				this.mediaFilename || undefined
			);
		} catch (error: any) {
			cli.printError(`[WhatsApp] Failed to download media: ${error?.message || error}`);
			return null;
		}
	}

	async getChat() {
		return { isGroup: this.isGroup };
	}
}

function unwrapMessage(message: any): any {
	let current = message;
	while (
		current?.ephemeralMessage?.message ||
		current?.viewOnceMessage?.message ||
		current?.viewOnceMessageV2?.message ||
		current?.viewOnceMessageV2Extension?.message ||
		current?.documentWithCaptionMessage?.message
	) {
		current =
			current.ephemeralMessage?.message ||
			current.viewOnceMessage?.message ||
			current.viewOnceMessageV2?.message ||
			current.viewOnceMessageV2Extension?.message ||
			current.documentWithCaptionMessage?.message;
	}
	return current;
}

export function createMessage(sock: WASocket, raw: WAMessage): Message {
	const content = unwrapMessage(raw.message);
	const contentType = content ? getContentType(content) : undefined;
	const media = contentType ? (content as any)[contentType] : undefined;

	const body =
		content?.conversation ||
		content?.extendedTextMessage?.text ||
		(contentType && MEDIA_CONTENT_TYPES.includes(contentType) ? media?.caption : "") ||
		"";

	const contextInfo = media?.contextInfo || content?.extendedTextMessage?.contextInfo;
	const hasMedia = !!contentType && MEDIA_CONTENT_TYPES.includes(contentType);
	const from = raw.key.remoteJid || "";
	const selfJid = jidNormalizedUser(sock.user?.id);

	const rawTimestamp = raw.messageTimestamp as any;
	const timestamp = rawTimestamp == null ? null : Number(typeof rawTimestamp === "object" ? rawTimestamp.toString() : rawTimestamp);

	return new Message(
		sock,
		raw,
		raw.key.id,
		from,
		selfJid,
		!!raw.key.fromMe,
		body,
		timestamp,
		!!contextInfo?.quotedMessage,
		hasMedia,
		isJidGroup(from) === true,
		media?.mimetype || null,
		media?.fileName || null
	);
}
