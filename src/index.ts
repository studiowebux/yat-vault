#!/usr/bin/env node

import parseArgs from "minimist";
import DecryptSecret from "./commands/decryptSecret";
import EditSecret from "./commands/editSecret";
import EncryptSecret from "./commands/encryptSecret";
import GenerateEnv from "./commands/generateEnv";
import GenerateKeyPair from "./commands/generateKeyPair";
import GenerateSecret from "./commands/generateSecret";
import SyncSecrets from "./commands/syncSecrets";
import UploadKeys from "./commands/uploadKeys";
import PrintHelp from "./libs/Help";
import { LogError } from "./libs/Help";

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
      return await DecryptSecret(argv["filename"], argv["overrides"]);
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

    if (argv["dotenv"]) {
      return await GenerateEnv(
        argv["filename"],
        argv["env"],
        argv["overrides"]
      );
    }

    PrintHelp();
  } catch (e: any) {
    process.env.DEBUG ? LogError(e.stack) : LogError(`${e.message}`);
    process.exit(1);
  }
})();
