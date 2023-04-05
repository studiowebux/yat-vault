console.log("hi");

import Encryption from "./libs/Encryption";
import Writer from "./libs/Writer";
import Input from "./libs/Input";
import Data from "./libs/Data";

(async () => {
  const writer = new Writer();
  const input = new Input();
  const data = new Data("./secrets.yml");

  const { privateKey, publicKey } = Encryption.GenerateKeyPair("Hola!");
  writer.Save("cle.pub", publicKey);
  writer.Save("cle.key", privateKey);

  const encryption = new Encryption(privateKey, publicKey);
  const bEncrypted = encryption.EncryptData(
    Buffer.from("Bonjour Comment ça va ?")
  );
  console.debug(bEncrypted.toString("base64"));

  const passphrase = await input.ReadInputHidden("Passphrase: ");

  const bUnencrypted = await encryption.DecryptData(bEncrypted, passphrase);
  console.debug(Buffer.from(bUnencrypted).toString());

  const secrets = data.Load();
  console.debug(secrets);
  console.log(secrets.phrase);

  // TODO: Decrypt saved secrets

  secrets["phrase"] = bEncrypted.toString("base64");
  data.Save(secrets);
})();
