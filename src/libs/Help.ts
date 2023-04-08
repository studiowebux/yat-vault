export default function PrintHelp() {
  console.log(`
Available Commands:
yat-vault --key-gen --key-name myKeyPair
yat-vault --create --filename vault.dev

yat-vault --edit --filename vault.dev.yml
yat-vault --encrypt --filename vault.dev.yml
yat-vault --print --filename vault.dev.yml
yat-vault --sync --filename vault.dev.yml
yat-vault --upload --filename vault.dev.yml --provider aws --region ca-central-1

yat-vault --dotenv --filename vault.dev.yml --env .env.dev

Documentation: https://github.com/yet-another-tool/yat-vault
    `);
}
