import { Color } from "./Colors";

export default function PrintHelp() {
  console.log(`
Available Commands:
yat-vault --key-gen --key-name myKeyPair
yat-vault --create --filename vault.dev

yat-vault --edit --filename vault.dev.yml
yat-vault --encrypt --filename vault.dev.yml
yat-vault --print --filename vault.dev.yml [--overrides config.local.json]
yat-vault --sync --filename vault.dev.yml
yat-vault --upload --filename vault.dev.yml --provider aws --region ca-central-1

yat-vault --dotenv --filename vault.dev.yml --env .env.dev [--overrides config.local.json]

Documentation: https://github.com/yet-another-tool/yat-vault
`);
}

export const Success = (text: string) => {
  console.log(Color("✔︎", "FgGreen"), Color("SUCCESS:", "FgGreen"), text);
};

export const Info = (text: string) => {
  console.log(Color("ℹ︎", "FgCyan"), Color("INFO:", "FgCyan"), text);
};

export const Warn = (text: string) => {
  console.log(Color("!", "FgMagenta"), Color("WARN:", "FgMagenta"), text);
};

export const Error = (text: string) => {
  console.log(Color("✘", "FgRed"), Color("ERROR:", "FgRed"), text);
};
