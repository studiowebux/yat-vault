import { readFileSync } from "node:fs";

export default class Reader {
  constructor() {}

  public Read(filename: string) {
    readFileSync(filename, { encoding: "utf-8" });
  }
}
