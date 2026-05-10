FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 5050

# Start the application
CMD ["npm", "start"]
