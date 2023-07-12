#!/bin/bash

npm run build

node build/index.js --print --filename example/test.no.aws.yml
node build/index.js --dotenv --filename example/test.no.aws.yml --overrides example/local.config.json --env .env.local

node build/index.js --key-gen --key-name example/withpassphrase
node build/index.js --create --filename example/vault.passphrase
node build/index.js --encrypt --filename example/vault.passphrase.yml
node build/index.js --print --filename example/vault.passphrase.yml

node build/index.js --print --filename example/vault.urls.yml --overrides example/local.config.json
node build/index.js --print --filename example/vault.urls.yml
node build/index.js --dotenv --filename example/vault.urls.yml --overrides example/local.config.json --env .env.local

export AWS_PROFILE=default
STAGE=dev node build/index.js --sync --filename example/test.yml
node build/index.js --upload --filename example/test.yml --region ca-central-1 --provider aws
