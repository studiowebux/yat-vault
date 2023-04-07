import { readFileSync, existsSync } from "node:fs";

export default class Reader {
  constructor() {}

  public static Read(filename: string) {
    return readFileSync(filename, { encoding: "utf-8" });
  }

  public static Exists(filename: string) {
    return existsSync(filename);
  }
}
