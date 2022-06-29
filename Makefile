all: static test

u: update-jest-lib md

update-jest-lib:
	cd lib && npm run test --- -u

static: ts prettier

ts: ts-check-lib

prettier: prettier-lib

test: test-lib 

md: build-ts-docs fix-ts-docs run-docs-eval

build-ts-docs:
	cd lib && npm run docs

run-docs-eval:
	cd ex && npm run run-docs-eval

fix-ts-docs:
	cd ex && npm run fix-docs-ts

test-lib:
	cd lib && npm run test

ts-check-lib:
	cd lib && npm run ts

prettier-lib:
	cd lib && npm run prettier-check

install: lib-install ex-install

lib-install:
	cd lib && npm ci

lib-install:
	cd ex && npm ci

