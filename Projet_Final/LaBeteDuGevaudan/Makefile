SHELL := /bin/bash

DC := docker compose

.PHONY: up down logs ps rebuild sh-php sh-web sh-db

up:
$(DC) up -d

down:
$(DC) down

logs:
$(DC) logs -f --tail=200

ps:
$(DC) ps

rebuild:
$(DC) build --no-cache
$(DC) up -d

sh-php:
$(DC) exec php bash || true

sh-web:
$(DC) exec web sh || true

sh-db:
$(DC) exec db bash || true
