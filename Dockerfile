# stage 0
FROM node:10-alpine as builder

WORKDIR /opt/serve-cra

COPY package*.json /opt/serve-cra/

ENV NODE_ENV=production

RUN npm install --production

COPY . .

USER node

# stage 1
FROM node:10-alpine

WORKDIR /

COPY --from=builder /opt/serve-cra /opt/serve-cra

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "/opt/serve-cra"]
