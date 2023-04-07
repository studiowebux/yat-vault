# WIP

SEE TODO

# Development

## Prerequisites

```bash
npm install
npm run build
```

---

## Tests

### Full Loop test (Using Environment Variable, CI Environment)

> For simplicity, you should always secure your key pair, and pass it as base64 format to avoid format errors

```bash
node build/index.js --key-gen --key-name test
node build/index.js --create --filename test

export PRIVATE_KEY=$(cat test.key | base64)
export PUBLIC_KEY=$(cat test.pub | base64)

node build/index.js --print --filename test.yml

node build/index.js --edit --filename test.yml
node build/index.js --print --filename test.yml

node build/index.js --encrypt --filename test.yml

node build/index.js --sync --filename test.yml

node build/index.js --upload --filename test.yml --region ca-central-1 --provider aws

```

### Testing Base64 without base64 format (Not Recommended)

```bash
export PRIVATE_KEY=$(cat test.key)
export PUBLIC_KEY=$(cat test.pub)

node build/index.js --print --filename test.yml
```
