#!/usr/bin/env node

import parseArgs from "minimist";
import DecryptSecret from "./commands/decryptSecret";
import EditSecret from "./commands/editSecret";
import EncryptSecret from "./commands/encryptSecret";
import GenerateKeyPair from "./commands/generateKeyPair";
import GenerateSecret from "./commands/generateSecret";
import SyncSecrets from "./commands/syncSecrets";
import UploadKeys from "./commands/uploadKeys";

const { version, name, author } = require("../package.json");

const argv = parseArgs(process.argv.slice(2));

(async () => {
  try {
    console.log(`${name}: V${version} @ ${author}`);
    if (argv["key-gen"]) {
      return await GenerateKeyPair(argv["key-name"]);
    }

    if (argv["create"]) {
      return await GenerateSecret(argv["filename"]);
    }

    if (argv["edit"]) {
      return await EditSecret(argv["filename"]);
    }

    if (argv["encrypt"]) {
      return await EncryptSecret(argv["filename"]);
    }

    if (argv["print"]) {
      return await DecryptSecret(argv["filename"]);
    }

    if (argv["sync"]) {
      return await SyncSecrets(argv["filename"]);
    }

    if (argv["upload"]) {
      return await UploadKeys(
        argv["filename"],
        argv["provider"],
        argv["region"]
      );
    }
  } catch (e: any) {
    console.error(`\nERR: ${e.message}`);
    process.env.DEBUG ?? console.error(e.stack);
    process.exit(1);
  }
})();
