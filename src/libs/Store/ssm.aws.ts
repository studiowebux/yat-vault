import {
  SSMClient,
  SSMClientConfig,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";
import Store from "../Store";
import { LogError, LogInfo } from "../Help";
import { Color } from "../Colors";

export default class AwsSSM extends Store {
  private client: SSMClient | undefined;

  constructor(
    opts: SSMClientConfig,
    region: string = "us-east-1",
    variables: Array<any> = []
  ) {
    super("aws.ssm", region, variables);

    opts.region = region;
    this.client = new SSMClient(opts);
  }

  public GetClient(): SSMClient | undefined {
    return this.client;
  }

  public async Sync(data: Array<any>): Promise<object> {
    const _data = [...data];

    return await Promise.all(
      this.ReplaceVariables(_data).map(
        (item) =>
          new Promise(async (resolve, reject) => {
            try {
              await this.client?.send(
                new PutParameterCommand({
                  Name: item.name,
                  Value: item.value,
                  Type: item.type,
                  Description: item.description,
                  Overwrite: item.overwrite,
                })
              );

              LogInfo(
                `aws.ssm: Update for ${Color(item.name, "Bold")} ${Color(
                  "Synced",
                  "FgGreen"
                )}.`
              );
              return resolve(item.name);
            } catch (e: any) {
              if (
                e.message.includes("The parameter already exists.") &&
                item.overwrite === false
              ) {
                LogInfo(
                  `${this.storeType}: Update for ${Color(
                    item.name,
                    "Bold"
                  )} ${Color("Skipped", "FgYellow")}. Reason: ${Color(
                    "No Overwrite requested.",
                    "Bold"
                  )}`
                );
                return resolve(null);
              } else {
                LogError(e.message);
                return reject(new Error(e.message));
              }
            }
          })
      )
    );
  }

  public Drift(): Object {
    throw new Error(`${this.storeType} - Method not implemented.`);
  }
}
