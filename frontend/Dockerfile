# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Install a lightweight HTTP server to serve static files
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Define the command to run the app
# CMD ["npm", "start"]

# Define the command to serve the built app
CMD ["serve", "-s", "build"]