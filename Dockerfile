# Use the latest Node.js version
FROM node:23-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json file and yarn.lock file
COPY package.json yarn.lock ./

# Install the dependencies
RUN yarn install

# Accept build arguments
ARG FRAPPE_ADMIN_AUTH_SECRET
ARG AWS_S3_BUCKET_BASE_FOLDER
ARG AWS_S3_BUCKET_NAME
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_ACCESS_KEY_ID
ARG AWS_S3_REGION
ARG NEXT_PUBLIC_BASE_URL
ARG FRAPPE_BASE_URL
ARG NEXT_PUBLIC_FRAPPE_DOMAIN_NAME
ARG NODE_ENV
ARG AUTH_SECRET
ARG FRAPPE_ADMIN_AUTH_KEY

# Set the environment variables
ENV FRAPPE_ADMIN_AUTH_SECRET=$FRAPPE_ADMIN_AUTH_SECRET
ENV AWS_S3_BUCKET_BASE_FOLDER=$AWS_S3_BUCKET_BASE_FOLDER
ENV AWS_S3_BUCKET_NAME=$AWS_S3_BUCKET_NAME
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_S3_REGION=$AWS_S3_REGION
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV FRAPPE_BASE_URL=$FRAPPE_BASE_URL
ENV NEXT_PUBLIC_FRAPPE_DOMAIN_NAME=$NEXT_PUBLIC_FRAPPE_DOMAIN_NAME
ENV NODE_ENV=$NODE_ENV
ENV AUTH_SECRET=$AUTH_SECRET
ENV FRAPPE_ADMIN_AUTH_KEY=$FRAPPE_ADMIN_AUTH_KEY

# Copy the rest of the files
COPY . .

# Build the app
RUN yarn build

# Expose the port
EXPOSE 3000

# Start the app
CMD ["yarn", "start"]