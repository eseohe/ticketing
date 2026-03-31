# Install dependencies and run dev server.
# For production, override the CMD: CMD ["sh", "-c", "npm run build && npx serve -s dist -l 5173"]
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
