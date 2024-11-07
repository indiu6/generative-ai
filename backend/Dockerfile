# Use an official Node.js runtime as a parent image
FROM node:16-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080
EXPOSE 8081

# Define the command to run the app
CMD ["npm", "start"]

# # Stage 1: Build the application
# FROM node:16-alpine AS builder

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install production dependencies
# RUN npm install

# # Copy the rest of the application code
# COPY . .

# # Build the TypeScript code
# RUN npm run build

# # Stage 2: Create the production image
# FROM node:16-alpine

# # Set the working directory
# WORKDIR /app

# # Copy only the necessary files from the builder stage
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/dist ./dist

# # Expose the ports the app runs on
# EXPOSE 8080
# EXPOSE 8081

# # Define the command to run the app
# CMD ["node", "dist/index.js"]
