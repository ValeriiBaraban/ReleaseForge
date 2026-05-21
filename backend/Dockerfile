FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm cache clean --force && npm ci --omit=dev
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]