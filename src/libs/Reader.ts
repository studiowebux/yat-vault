import { readFileSync } from "node:fs";

export default class Reader {
  constructor() {}

  public static Read(filename: string) {
    return readFileSync(filename, { encoding: "utf-8" });
  }
}
