import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export default class Writer {
  constructor() {}

  public static Write(filename: string) {
    spawnSync("vi", [filename], { stdio: "inherit" });
  }

  public static Save(filename: string, content: string) {
    writeFileSync(filename, content);
  }
}
