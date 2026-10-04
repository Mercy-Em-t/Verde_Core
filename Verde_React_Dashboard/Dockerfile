FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose Vite port
EXPOSE 5173

# Run the dev server and expose it to the host network
CMD ["npm", "run", "dev", "--", "--host"]
