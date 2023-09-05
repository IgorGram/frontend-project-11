install:
	npm ci

lint:
	npx eslint .

serve:
	npx webpack serve

build:
	NODE_ENV=production npx webpack
