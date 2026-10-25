const startsWithIgnoreCase = (str: string, prefix: string) => str.toLowerCase().startsWith(prefix.toLowerCase());

// Reduces a WhatsApp JID (e.g. "49123456789:12@s.whatsapp.net") to digits only
const normalizePhoneNumber = (value: string | undefined | null) => (value || "").split("@")[0].split(":")[0].replace(/\D/g, "");

export { startsWithIgnoreCase, normalizePhoneNumber };
