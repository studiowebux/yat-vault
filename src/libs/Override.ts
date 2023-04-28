import { readFileSync } from "fs";
import path from "node:path";

export default class Override {
  private overrideFilename: string;
  private overridePath: string;

  constructor(overrideFilename: string) {
    this.overrideFilename = path.basename(overrideFilename);
    this.overridePath = path.dirname(overrideFilename);
  }

  public Load(): object {
    return JSON.parse(
      readFileSync(
        path.resolve(path.join(this.overridePath, this.overrideFilename)),
        { encoding: "utf-8" }
      )
    );
  }
}
