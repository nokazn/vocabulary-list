FROM node:12-alpine
ENV PORT=3000
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
CMD ["yarn", "start"]
