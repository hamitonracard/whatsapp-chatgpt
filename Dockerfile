FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev


FROM node:22-bookworm-slim

# ffmpeg is required for audio conversion (OpenAI transcription) and TTS
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ffmpeg ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV SESSION_PATH=/app/session

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

RUN mkdir -p /app/session && chown -R node:node /app

USER node

CMD ["npm", "start"]
