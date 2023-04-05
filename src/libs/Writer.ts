import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export default class Writer {
  constructor() {}

  public Write(filename: string) {
    spawnSync("vi", [filename], { stdio: "inherit" });
  }

  public Save(filename: string, content: string) {
    writeFileSync(filename, content);
  }
}
