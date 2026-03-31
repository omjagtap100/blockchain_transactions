FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first for better layering
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Expose the API port (Matching COMPANY_PORT in .env)
EXPOSE 5500

# Set environment variables
ENV NODE_ENV=production

# Start the application (src/company.js)
CMD ["npm", "start"]