FROM node:18-alpine AS development
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm i
COPY --chown=node:node . .
EXPOSE 3001
USER node
ENV NODE_ENV sandbox
CMD ["npm", "run", "start:prod"]