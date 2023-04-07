import { fromEnv } from "./Utils";

export default abstract class Store {
  protected storeType: string;
  protected region: string;
  protected variables: Array<any>;
  protected regexes: Array<any>;

  constructor(storeType: string, region: string, variables: Array<any>) {
    this.storeType = storeType;
    this.region = region;
    this.variables = variables || [];

    this.regexes = [
      ...(Object.keys(this.variables).map((key) => ({
        key: key,
        value: new RegExp(`{${key}}`, "g"),
      })) || []),
    ];
  }

  abstract Sync(data: Array<any>): Object;

  abstract Drift(data: Array<any>): Object;

  protected ReplaceVariables(data: Array<any>): Array<any> {
    if (!this.variables) return data;
    const updatedData = [...data].map((item) => {
      this.regexes.forEach((regex) => {
        item.name = item.name
          .replace(regex.value, fromEnv(this.variables[regex.key]) || item.name)
          .replaceAll("{region}", this.region);
      });

      return item;
    });
    Object.values(updatedData).forEach((i: any) =>
      console.log(
        `${this.storeType}: Key to Sync => ${i.name} (Overwrite ${
          i.overwrite ? "ON" : "OFF"
        })`
      )
    );

    return updatedData;
  }
}
