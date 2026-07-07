FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx vite build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts .
COPY --from=build /app/server ./server
COPY --from=build /app/package*.json ./
COPY --from=build /app/index.html .
COPY --from=build /app/src ./src
RUN mkdir -p /app/data && chown -R appuser:appgroup /app
EXPOSE 3000
USER appuser
CMD ["npx", "tsx", "server.ts"]
