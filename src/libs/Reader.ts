import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export default class Reader {
  constructor() {}

  public static Read(filename: string) {
    return readFileSync(path.resolve(filename), { encoding: "utf-8" });
  }

  public static Exists(filename: string) {
    return existsSync(path.resolve(filename));
  }
}
