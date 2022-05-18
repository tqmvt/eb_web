# Ebisu's Bay Web

## Run locally
```
TODO
```

## Run locally (docker compose)

```
cd /<pathtorepository>/eb_web
```

### MacOS
#### Build and run

```
docker compose -f docker-compose.yml up --build
```

Verify:
```
#curl -i http://localhost:8080/health
```

Check running containers:
```
% docker ps
CONTAINER ID   IMAGE                            COMMAND                  CREATED          STATUS                             PORTS                            NAMES
54cc2059012e   eb_web_ebisusbay-web-nginx   "/entrypoint.sh"         11 seconds ago   Up 10 seconds (health: starting)   80/tcp, 0.0.0.0:8080->8080/tcp   ebisusbay-web-nginx
1d715f5fa1c3   eb_web_ebisusbay-web         "docker-entrypoint.s…"   11 seconds ago   Up 10 seconds                      0.0.0.0:3000->3000/tcp           ebisusbay-web
```

To shutdown stack:
```
CTRL+C
```
or
```
docker compose -f docker-compose.yml down
```

Logs:
```
tail -f ./volumes/ebisusbay-web-nginx_logs/access.log
tail -f ./volumes/ebisusbay-web-nginx_logs/error.log
tail -f ./volumes/ebisusbay-web_logs/nodejs.log
```

Connect to individual container via "SSH":
```
docker exec -it ebisusbay-web-nginx /bin/bash
docker exec -it ebisusbay-web /bin/bash
```

Useful commands:
Delete:
  - all stopped containers
  - all networks not used by at least one container
  - all images without at least one container associated to them
  - all build cache
```
docker system prune -a
```

Delete:
  - Same as above + "all volumes not used by at least one container"
```
docker system prune -a --volumes
```
