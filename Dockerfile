# Stage 1: build the app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# Stage 2: serve with nginx
FROM nginx:alpine

# remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# expose port
EXPOSE 4174

CMD ["nginx", "-g", "daemon off;"]
