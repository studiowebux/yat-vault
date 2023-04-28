import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { RLInterface } from "../types/types";

export default class Input {
  public async ReadInputHidden(question: string): Promise<string> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input,
        output,
        prompt: "",
      }) as RLInterface;

      let state = true;
      let dirty = false;
      rl._writeToOutput = (content: string) => {
        if (state) {
          rl.output.write(content);
          state = false;
        }
        if (content !== question) {
          rl.output.write("*");
          dirty = true;
        } else if (dirty) {
          // NOTE: Bring back the question if the input is empty.
          rl.output.write(question);
        }
      };
      // FIXME: Backspace remove the question and keep an empty spot.
      rl.question(question, (answer) => {
        rl.output.write("\n\r");
        rl.close();
        return resolve(answer);
      });
    });
  }

  public async ReadInput(question: string): Promise<string> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input,
        output,
        prompt: "",
      }) as RLInterface;

      rl.question(question, (answer) => {
        rl.output.write("\n\r");
        rl.close();
        return resolve(answer);
      });
    });
  }
}
