FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . .

# Build step (if using TypeScript)
RUN npm run build

# Install only production deps
RUN npm prune --production

EXPOSE 4000
CMD ["npm", "start"]
