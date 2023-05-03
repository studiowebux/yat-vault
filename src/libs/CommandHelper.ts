import Input from "../libs/Input";
import { IOverride, secret } from "../types/types";
import Data from "./Data";
import Encryption from "./Encryption";
import { Info } from "./Help";

const input = new Input();

export async function decryptSecret(
  data: Data,
  encryption: Encryption | undefined,
  overrideValues: IOverride | undefined = {}
): Promise<secret[]> {
  // Decrypt values
  let values: secret[] = [];
  try {
    Info("Decrypting values...");
    values = await data.DecryptValues(
      encryption,
      process.env.PASSPHRASE || "",
      overrideValues
    );
  } catch (e: any) {
    // Try to ask for a passphrase
    if (process.env.NO_TTY === "true") {
      // NO TTY, throw error
      throw e;
    }
    if (e.message.includes("ERR_DECRYPTION")) {
      const passphrase = await input.ReadInputHidden("Passphrase: ");
      values = await data.DecryptValues(encryption, passphrase, overrideValues);
    } else {
      throw e;
    }
  }

  Info("values decrypted.");
  return values;
}
