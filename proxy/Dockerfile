FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY conf.d/web.conf /etc/nginx/conf.d/web.conf
COPY conf.d/security_headers.conf /etc/nginx/conf.d/security_headers.conf

# Install tools
RUN apt update && apt install -y curl procps htop

# Install the NGINX Amplify Agent
RUN apt update \
    && apt install -qqy curl gnupg2 \
    && echo 'deb https://packages.amplify.nginx.com/py3/debian bullseye amplify-agent' > /etc/apt/sources.list.d/nginx-amplify.list \
    && curl -fs https://nginx.org/keys/nginx_signing.key | apt-key add - > /dev/null 2>&1 \
    && apt update \
    && apt install -qqy nginx-amplify-agent \
    && apt purge -qqy gnupg2 \
    && rm -rf /etc/apt/sources.list.d/nginx-amplify.list \
    && rm -rf /var/lib/apt/lists/*

COPY nginx-amplify/agent.conf /etc/amplify-agent/agent.conf
RUN sed -i='' -e "s|CONFFILE=/etc/amplify-agent/agent.conf|CONFFILE=/etc/amplify-agent/custom/agent.conf|" /etc/init.d/amplify-agent

# The /entrypoint.sh script will launch nginx and the Amplify Agent.
# The script honors AMPLIFY_API_KEY and AMPLIFY_IMAGENAME environment
# variables, and updates /etc/amplify-agent/agent.conf accordingly.

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
