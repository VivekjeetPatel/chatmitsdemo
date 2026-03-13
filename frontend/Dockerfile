# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package management files
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the application for production
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration for client-side routing and performance
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
