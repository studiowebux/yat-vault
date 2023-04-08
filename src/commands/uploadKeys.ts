import Data from "../libs/Data";
import Input from "../libs/Input";
import AwsLoader from "../libs/Loader/aws.ssm";

const input = new Input();

export default async function UploadKeys(
  filename: string,
  provider: string,
  region: string
) {
  // Inputs
  const _filename =
    process.env.FILENAME || filename || (await input.ReadInput("File Name: "));
  const _provider =
    process.env.PROVIDER || provider || (await input.ReadInput("Provider: "));
  const _region =
    process.env.REGION || region || (await input.ReadInput("Region: "));

  // Verifications
  if (!_filename) throw new Error("Missing File Name.");
  if (!_provider) throw new Error("Missing Provider.");

  // Processing
  const data = new Data(_filename);

  const awsLoader = new AwsLoader(_region);
  await awsLoader.UploadKeys(
    data.GetConfig(_provider)?.privateKeyPath as string,
    data.GetConfig(_provider)?.publicKeyPath as string,
    (await data.GetPrivateKey()) as string,
    (await data.GetPublicKey()) as string
  );

  // Output
  console.log("SUCCESS: Keys Uploaded !");
}
