import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

export default class Writer {
  constructor() {}

  public static Write(filename: string) {
    spawnSync(process.env.EDITOR || "vi", [path.resolve(filename)], {
      stdio: "inherit",
    });
  }

  public static Save(filename: string, content: string) {
    writeFileSync(path.resolve(filename), content);
  }
}
