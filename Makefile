all: static test build-ts-docs

u: update-jest-lib

update-jest-lib:
	cd lib && npm run test --- -u

static: ts prettier

ts: ts-check-lib

prettier: prettier-lib

test: test-lib 

build-ts-docs:
	cd lib && npm run docs

test-lib:
	cd lib && npm run test

ts-check-lib:
	cd lib && npm run ts

prettier-lib:
	cd lib && npm run prettier-check

install: docs-install lib-install

lib-install:
	cd lib && npm ci

build-docs-app:
	cd ex && npm run build