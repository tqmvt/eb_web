#####################
### Runtime image ###
#####################

FROM node:16.16.0-slim

# Update packages
RUN apt-get update && apt-get install -y git curl procps htop net-tools netcat dnsutils

# Does not work
# RUN npm install -g npm@latest
# RUN npm install -g npm@v8.7.0

# Latest npm version that works
RUN npm install -g npm@v8.5.5

# Print Node.js & npm versions
RUN node --version
RUN npm --version

# Copy the required files
WORKDIR /usr/src/app

COPY .husky ./.husky
COPY pages ./pages
COPY public ./public
COPY src ./src
COPY next.config.js ./

COPY package*.json ./
COPY .next ./.next
COPY node_modules ./node_modules

# Enable APM Insight Node.js Agent
RUN mkdir -p /usr/src/app/apminsightdata && chown -R node:node /usr/src/app/apminsightdata

# Enable logging
RUN mkdir -p /var/log/nodejs && touch /var/log/nodejs/nodejs.log && chown -R node:node /var/log/nodejs

# Install dumb-init
RUN apt-get update && apt-get install -y dumb-init

#Harden Image
COPY ./harden.sh .
RUN chmod +x harden.sh && \
    sh harden.sh && \
    rm -f harden.sh

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/bin/bash", "-c", "exec npm run start-web >> /var/log/nodejs/nodejs.log 2>&1"]

# Force container to run as a non-root user
USER node
