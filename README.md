<div align="center">

<img src="./docs/vault.png" alt="Project Logo" width="256">

<h2>Yet Another Tool - Vault</h2>

<p>A CLI tool to manage application secrets, built with AWS SSM Support.</p>
<p>You can commit you configurations and encrypt your secrets, share the private key through AWS SSM Secure String and more !</p>

<p align="center">
  <a href="https://github.com/yet-another-tool/yat-vault/issues">Report Bug</a>
  ·
  <a href="https://github.com/yet-another-tool/yat-vault/issues">Request Feature</a>
</p>
</div>

---

<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about">About</a>
    </li>
    <li><a href="#installation">Installation</a></li>
    <li>
      <a href="#usage">Usage</a>
    </li>
    <li><a href="#environment-variables">Environment Variables</a></li>
    <li><a href="#changelog">Changelog</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>
---

## About

- Generate Key Pair ('RSA')
- Create Empty secret file using a template
- Encrypt only your secure parameters
- Store all your configurations and commit them encrypted
- Use terminal editor and encrypt the changes automatically
- Use external editor and encrypt the changes manually
- Print the decrypted values on your screen
- Upload your key pair on AWS SSM _(Only AWS SSM is supported for the moment, create a PR for more integrations)_
- Sync your local configurations to AWS SSM
- Generate a .env file using your secrets
- Compatible with your CI, using the environment variables
- Made with NodeJS 18 and Typescript, built to be extended and improved
- Support override configurations and default values, it gives flexibility for local and cloud development setup. Provide simple way to standardize and use the same configuration across all machines and environments.

## Installation

```bash
npm install -g @yetanothertool/yat-vault
```

---

## Usage

### Create new Key Pair

```bash
yat-vault --key-gen --key-name test
```

> It creates a key pair named:
> _Private Key:_ `test.key` and _Public Key:_ `test.pub`

#### There is multiple ways to load the keys

**Environment Variables**

```bash
export PRIVATE_KEY=$(cat test.key | base64)
export PUBLIC_KEY=$(cat test.pub | base64)
```

_or (Not Recommended)_

```bash
export PRIVATE_KEY=$(cat test.key)
export PUBLIC_KEY=$(cat test.pub)
```

**secret file**

Update the following keys to use your **local** key pair:

- `_configurations.publicKeyPath`
- `_configurations.privateKeyPath`

Update the following keys to use your **AWS** key pair:

- `_configurations.aws.publicKeyPath`
  - _This path must be a SSM path_
- `_configurations.aws.privateKeyPath`
  - _This path must be a SSM path_
- `_configurations.aws.awsRegion`
  - _This region must be the one containing the parameters_

---

### Create new Secret File

```bash
mkdir vault/
yat-vault --create --filename ./vault/test

# or to create it in the current directory
yat-vault --create --filename test
```

> It generates an empty secret file named `test.yml`

#### The secret file structure

> See the example directory.

The file is split in two main sections:

- **\_values**
- **\_configurations**

The **\_values** section defined your values to save in the vault.  
This is an array containing the parameter using this format:

```yaml
_values:
  - name: /the/ssm/path/with/the/name/of/your/parameter
    value: The Value to store or encrypt
    description: an optional description
    type: String|SecureString|StringList
    overwrite: false
    envName: The environment key to generate the .env file
```

You can use a concept of **variables** to dynamically set the **name** of your parameter.  
To do so you must define the key/value in the `_configurations.variables` array.

```yaml
_values:
  - name: /{tenant}/{project_name}/{stage}/password
    value: my super password that will be encrypted
    description: password is safe here
    type: SecureString
    overwrite: false
    envName: The environment key to generate the .env file

_configurations:
  variables:
    tenant: wl
    project_name: yat-vault
    stage: env:STAGE
```

The **variables** array contains the value for each key. They will be automatically replaced when syncing.  
You can also use the **environment variables**.  
You simply prepend: `env:` followed by the environment name.

**AWS**:

This object has the `regions` array, it let you deploy quickly using the multi region approach.
the variable `{region}` automatically resolves to the current region, this way you can specify the region in the parameter name if needed.

**Variables within values and overrides**:

This feature must respect a format: `${my_variable:-defaultValue}` or `${my_variable}`. **_Very similar to bash_**

Where `my_variable` is the name used in your overrides file (See the [Example](example/local.config.json))
and `defaultValue` is the value to use in case that the override file isn't present or the variable isn't overidden.

The `:-` it means that the left part is the variable name and the right part the default value. This flag is optional. If not define, there is no default value, thus the variable will stay as-is

_Character allowed:_

- `a-z` and `A-Z`
- `0-9`
- `underscores ( _ )`
- I didn't test other characters. I know that _dashes ( - ) WON'T WORK_.

The goal of this feature is to let developers configure their local environment quickly and easily and still use the same configuration that the cloud (or deployed) infrastructure has. This way the setup is self documented and the configuration follows everywhere.

---

### Edit Secret File

```bash
yat-vault --edit --filename test.yml
```

It opens `vi` to let you update your configuration, once you save the file, it automatically encrypt the new values.

> As of V0.0.0, it doesn't refresh/encrypt everything if you change the key pair.
> DON'T change the key pair. You will get a weird behaviour.

---

### Print Secret File Values

> **Be careful, this command expose all your secrets on your terminal !**

```bash
yat-vault --print --filename test.yml --overrides config.local.json
```

It decrypts and prints all values on your screen.  
The `--overrides filename.json` let you use the variables see above for more details

---

### Encrypt Secret File

You don't have `vi`; You don't like `vi`; No problem.  
This command encrypt your file.

```bash
yat-vault --encrypt --filename test.yml
```

---

### Upload your Key pair

This command saves your key pair in AWS, using the configuration defined in the secret file.
You must specify an AWS region (Currently, only AWS is supported)

```bash
yat-vault --upload --filename test.yml --region ca-central-1 --provider aws
```

This way your CI, developers and etc can use the secrets without sharing the password.

> If you setup a passphrase, you will have to share it for now.

---

### Sync Your local secrets to your provider

To sync your local values to the cloud

```bash
yat-vault --sync --filename test.yml
```

The `overwrite` option determines if you can overwrite the values in SSM.  
This command is verbose to let you know what is going on.

---

### Generate .env file

```bash
yat-vault --dotenv --filename test.yml --env .env.test --overrides config.local.json
```

The `envName` in the secret file, determines the **Key** of your parameter.  
The `--overrides filename.json` let you use the variables see above for more details

### Values and Variables - Overrides and Defaults

The simplest way to explain that feature is to look this example:

- [config.local.json](example/local.config.json)
- [vault.urls.yml](example/vault.urls.yml)

Then these commands:

```bash
yat-vault --print --filename example/vault.urls.yml --overrides example/local.config.json
yat-vault --print --filename example/vault.urls.yml
yat-vault --dotenv --filename example/vault.urls.yml --overrides example/local.config.json --env example/.env.local
cat example/.env.local
yat-vault --dotenv --filename example/vault.urls.yml --env example/.env.local
cat example/.env.local
```

It allows you to specify varibales with optional default values. Then you can define a JSON to set the values.
For more details [Create new Secret File](#create-new-secret-file)

---

## Environment Variables

| Name           | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| EDITOR         | Change the default editor ('vi')                                    |
| DEBUG          | Print Error Stack Trace                                             |
| PASSPHRASE     | Non interactive passphrase (CI)                                     |
| PRIVATE_KEY    | Non interactive Private Key (CI)                                    |
| PUBLIC_KEY     | Non interactive Public Key (CI)                                     |
| FILENAME       | Equivalent to --file-name                                           |
| KEYNAME        | Equivalent to --key-name                                            |
| PROVIDER       | Equivalent to --provider                                            |
| REGION         | Equivalent to --region                                              |
| ENV_FILENAME   | Equivalent to --env                                                 |
| WITHOUT_QUOTES | Remove double quotes around values for .env files                   |
| NO_TTY         | Skip Asking passphrase on terminal (only value `true` is supported) |

---

## Changelog

The [TODO](./TODO)

### V1.2.2 - Alpha - 2023-05-10

- Tested default behaviour for overrides and defaults values
- Add special characters in the regex

<details>
  <summary>### V1.2.1 - Alpha - 2023-05-03</summary>

- Improved CLI Output (Colors, status, messages, error handling)
- Improve AWS Interactions and error handling when syncing values to AWS
- Fixed issue when trying to update keys already stored in SSM.
</details>

<details>
  <summary>### V1.1.0 - Alpha - 2023-04-26</summary>

- Added new feature
- you can specify variables within the values and load a JSON file to replace those values, plus you can specify default values
- Documentation for the new feature

</details>

<details>
  <summary>### V1.0.5 & V1.0.6 - Alpha - 2023-04-26</summary>

- Improved passphrase handling
- Bug fixed regarding the passphrase
</details>

<details>
  <summary>### V1.0.4 - Alpha - 2023-04-08</summary>

- AWS Configuration is optional
- Bug fixes
</details>
<details>
  <summary>### V1.0.3 - Alpha - 2023-04-08</summary>

- Added new feature, generate .env file
- Changed default values for aws ssm
- Updated Documentation
- Added print help
- Fixes and Improvements
</details>
<details>
  <summary>### V1.0.2 - Alpha - 2023-04-07</summary>

- Reviewed Documentation
</details>
<details>
  <summary>### V1.0.1 - Alpha - 2023-04-07</summary>

- First requirements implemented
- Deployed to npmjs
</details>

---

## Contributing

1. Create a Feature Branch
2. Commit your changes
3. Push your changes
4. Create a PR

<details>
<summary>Working with your local branch</summary>

**Branch Checkout:**

```bash
git checkout -b <feature|fix|release|chore|hotfix>/prefix-name
```

> Your branch name must starts with [feature|fix|release|chore|hotfix] and use a / before the name;
> Use hyphens as separator;
> The prefix correspond to your Kanban tool id (e.g. abc-123)

**Keep your branch synced:**

```bash
git fetch origin
git rebase origin/master
```

**Commit your changes:**

```bash
git add .
git commit -m "<feat|ci|test|docs|build|chore|style|refactor|perf|BREAKING CHANGE>: commit message"
```

> Follow this convention commitlint for your commit message structure

**Push your changes:**

```bash
git push origin <feature|fix|release|chore|hotfix>/prefix-name
```

**Examples:**

```bash
git checkout -b release/v1.15.5
git checkout -b feature/abc-123-something-awesome
git checkout -b hotfix/abc-432-something-bad-to-fix
```

```bash
git commit -m "docs: added awesome documentation"
git commit -m "feat: added new feature"
git commit -m "test: added tests"
```

</details>

### Local Development

```bash
npm install
npm run build
```

## License

Distributed under the MIT License. See LICENSE for more information.

## Contact

- Tommy Gingras @ tommy@studiowebux.com | Studio Webux

<div>
<b> | </b>
<a href="https://www.buymeacoffee.com/studiowebux" target="_blank"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Buy Me A Coffee"
        style="height: 30px !important; width: 105px !important"
/></a>
<b> | </b>
<a href="https://webuxlab.com" target="_blank"
      ><img
        src="https://webuxlab-static.s3.ca-central-1.amazonaws.com/logoAmpoule.svg"
        alt="Webux Logo"
        style="height: 30px !important"
/> Webux Lab</a>
<b> | </b>
</div>
