static: ts prettier

docs-install:
	cd docs && npm ci

lib-install:
	cd lib && npm ci

install: docs-install lib-install

ts: ts-docs ts-lib

ts-docs:
	cd docs && npm run ts

ts-lib:
	cd lib && npm run ts


prettier: prettier-docs prettier-lib

prettier-docs:
	cd docs && npm run prettier-check

prettier-lib:
	cd lib && npm run prettier-check