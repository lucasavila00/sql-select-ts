all: static test build-ts-docs


static: ts prettier

ts: ts-check-docs ts-check-lib

prettier: prettier-docs prettier-lib

test: test-lib test-docs-app

build-ts-docs:
	cd lib && npm run docs

test-lib:
	cd lib && npm run test

test-docs-app:
	cd docs && npm run test

ts-check-docs:
	cd docs && npm run ts

ts-check-lib:
	cd lib && npm run ts

prettier-docs:
	cd docs && npm run prettier-check

prettier-lib:
	cd lib && npm run prettier-check


install: docs-install lib-install

docs-install:
	cd docs && npm ci

lib-install:
	cd lib && npm ci

build-docs-app:
	cd docs && npm run build && touch dist/.nojekyll && cp src/404.html dist/404.html