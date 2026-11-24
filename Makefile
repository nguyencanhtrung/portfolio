.DEFAULT_GOAL := help
NPM ?= npm

.PHONY: help setup dev build preview test check clean

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##[ \t]*"; printf "Usage:\n  make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install dependencies from package-lock.json (npm ci)
	$(NPM) ci

dev: ## Start local Astro dev server (http://localhost:4321)
	$(NPM) run dev

build: ## Build static site and Pagefind search index into dist/
	$(NPM) run build

preview: ## Preview the production build in dist/
	$(NPM) run preview

test: ## Run unit tests
	$(NPM) test

check: test build ## Run unit tests and production build

clean: ## Remove generated build directories (dist/, .astro/)
	rm -rf dist .astro
