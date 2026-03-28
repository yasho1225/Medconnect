# Build for Nexlayer / Linux: docker build --platform=linux/amd64 -t YOUR_TAG .
FROM node:20-bookworm-slim AS builder

WORKDIR /app

ENV CI=1 \
    EXPO_NO_TELEMETRY=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx expo export -p web --output-dir dist

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
