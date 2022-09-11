# syntax=docker/dockerfile:1
FROM node:12-alpine
RUN apk add --no-cache python2 g++ make
WORKDIR /
COPY . .
RUN npm install --production
RUN npm install --only=production && npm cache clean --force && npm install -g typescript
RUN npm run build
CMD ["node", "dist/index.js"]
EXPOSE 3000