# Use the official lightweight Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files 
# (Even though there are no external dependencies currently, this ensures future compatibility)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# Create the data directory for flat-file JSON persistence and assign ownership to the node user
RUN mkdir -p data && chown -R node:node data

# Switch to the non-root 'node' user for security best practices
USER node

# Expose the port the server listens on
EXPOSE 3000

# Command to run the production server
CMD ["node", "server.js"]
