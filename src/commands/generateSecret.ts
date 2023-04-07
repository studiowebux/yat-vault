import Generator from "../libs/Generator";
import Input from "../libs/Input";
import Reader from "../libs/Reader";
import Writer from "../libs/Writer";

const input = new Input();

export default async function GenerateSecret(filename: string) {
  // Inputs
  let _filename =
    process.env.FILENAME || filename || (await input.ReadInput("File Name: "));

  // Verifications
  if (!_filename) throw new Error("Missing File Name.");
  if (Reader.Exists(`${_filename}.yml`))
    throw new Error("The secret file already exists.");

  // Processing
  const content = Generator.CreateSecretFile();

  // Save to disk
  Writer.Save(`${_filename}.yml`, content);

  // Output
  console.log("SUCCESS: Secret File Generated !");
}
