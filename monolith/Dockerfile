FROM node:21-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application code to the working directory
COPY . .

# Expose a port (if your application needs it)
EXPOSE 8080

# Start the application
CMD ["node", "--env-file=.env.production", "index.js"]