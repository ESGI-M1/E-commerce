#!/bin/bash
# renew certbot certificate
docker compose -f ../docker-compose.yml run --rm certbot
docker compose -f ../docker-compose.yml exec nginx nginx -s reload