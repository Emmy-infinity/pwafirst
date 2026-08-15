# frontend/Dockerfile
FROM node:20-slim

WORKDIR /app

# Copy everything including your already installed local node_modules
COPY . .

# Expose Vite's default development port
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]

