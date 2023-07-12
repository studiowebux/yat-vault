import { secret } from "../types/types";
import { Color } from "./Colors";

export const printValues = (values: secret[]) => {
  console.log(Color("Decrypted Values:", "Bold"));

  values.forEach((value) => {
    console.log(
      `${Color("SSM Path:", "Bold")} ${Color(
        value.name || "No Name Defined",
        "Underscore"
      )} | ${Color("Description:", "Bold")} ${Color(
        (value.description as string) || "No Description Defined",
        "Underscore"
      )}`
    );
    console.log(
      `${Color("Type:", "Bold")} ${Color(
        value.type || "No Type Defined",
        "Underscore"
      )} | ${Color("Env:", "Bold")} ${Color(
        value.envName as string,
        "Underscore"
      )} | ${Color("Overwrite:", "Bold")} ${Color(
        value.overwrite ? "Yes" : "No",
        "Underscore"
      )}`
    );
    console.log(
      `${Color("Value:", "Bold")} '${Color(value.value, "Underscore")}'`
    );
    console.log("---");
  });
};
