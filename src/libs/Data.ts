import { readFileSync, writeFileSync } from "fs";
import { load, dump } from "js-yaml";

export default class Data {
  private secretFilename: string;

  constructor(secretFilename: string) {
    this.secretFilename = secretFilename;
  }

  public Save(data: Object) {
    writeFileSync(this.secretFilename, dump(data));
  }

  public Load(): any {
    return load(
      readFileSync(this.secretFilename, { encoding: "utf-8" })
    ) as any;
  }
}
