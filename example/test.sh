#!/bin/bash

npm run build

node build/index.js --print --filename example/test.no.aws.yml

node build/index.js --key-gen --key-name example/withpassphrase
node build/index.js --create --filename example/vault.passphrase
node build/index.js --encrypt --filename example/vault.passphrase.yml
node build/index.js --print --filename example/vault.passphrase.yml

node build/index.js --print --filename example/vault.urls.yml --overrides example/local.config.json
node build/index.js --print --filename example/vault.urls.yml
node build/index.js --dotenv --filename example/vault.urls.yml --overrides example/local.config.json --env .env.local

