import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

interface RLInterface extends readline.Interface {
  _writeToOutput?: Function;
  output?: any;
}

export default class Input {
  private rl: RLInterface;

  constructor() {
    this.rl = readline.createInterface({ input, output, prompt: "" });
  }

  public async ReadInputHidden(question: string): Promise<string> {
    return new Promise((resolve) => {
      let state = true;
      let dirty = false;
      this.rl._writeToOutput = (content: string) => {
        if (state) {
          this.rl.output.write(content);
          state = false;
        }
        if (content !== question) {
          this.rl.output.write("*");
          dirty = true;
        } else if (dirty) {
          // NOTE: Bring back the question if the input is empty.
          this.rl.output.write(question);
        }
      };
      // FIXME: Backspace remove the question and keep an empty spot.
      this.rl.question(question, (answer) => {
        this.rl.output.write("\n\r");
        this.rl.close();
        return resolve(answer);
      });
    });
  }
}
