#####################
### Runtime image ###
#####################

FROM node:16-slim

# Update packages
RUN apt-get update && apt-get install -y git curl procps htop net-tools netcat dnsutils

# Copy the required files from the build step
WORKDIR /usr/src/app

COPY .husky ./.husky
COPY pages ./pages
COPY public ./public
COPY src ./src
COPY next.config.js ./

COPY package*.json ./
COPY .next ./.next
COPY node_modules ./node_modules

# Print Node.js version
RUN node --version

# Enable APM Insight Node.js Agent
RUN mkdir -p /usr/src/app/apminsightdata && chown -R node:node /usr/src/app/apminsightdata

# Enable logging
RUN mkdir -p /var/log/nodejs && touch /var/log/nodejs/nodejs.log && chown -R node:node /var/log/nodejs

# Add startup scripts
COPY start_web.sh /usr/local/bin/start_web.sh
RUN chmod +x /usr/local/bin/start_web.sh && ln -s /usr/local/bin/start_web.sh /

# Harden Image
# COPY ./harden.sh .
# RUN chmod +x harden.sh && \
#     sh harden.sh && \
#     rm -f harden.sh

# Force container to run as a non-root user
USER node
