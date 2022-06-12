all: static test


static: ts prettier

ts: ts-docs ts-lib

prettier: prettier-docs prettier-lib

test: test-lib

test-lib:
	cd lib && npm run test

ts-docs:
	cd docs && npm run ts

ts-lib:
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
