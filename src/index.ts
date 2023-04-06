import parseArgs from "minimist";
import DecryptSecret from "./cases/decryptSecret";
import EditSecret from "./cases/editSecret";
import GenerateKeyPair from "./cases/generateKeyPair";
import GenerateSecret from "./cases/generateSecret";

const argv = parseArgs(process.argv.slice(2));

(async () => {
  try {
    if (argv["key-gen"]) {
      return await GenerateKeyPair(argv["key-name"]);
    }

    if (argv["create"]) {
      return await GenerateSecret(argv["filename"]);
    }

    if (argv["edit"]) {
      return await EditSecret(argv["filename"]);
    }

    if (argv["print"]) {
      return await DecryptSecret(argv["filename"]);
    }

    if (argv["sync"]) {
      throw new Error("Not Implemented.");
    }
  } catch (e: any) {
    console.error(`\nERR: ${e.message}`);
    process.exit(1);
  }
})();
