import {
  SSMClient,
  SSMClientConfig,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";
import Store from "../Store";
import { Info } from "../Help";
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

  public async Sync(data: Array<any>): Promise<Object> {
    const _data = [...data];
    console.log(Color("⇪", "FgBlue"), `aws.ssm: Processing '${this.region}'`);
    return Promise.all(
      this.ReplaceVariables(_data).map((item) =>
        this.client
          ?.send(
            new PutParameterCommand({
              Name: item.name,
              Value: item.value,
              Type: item.type,
              Description: item.description,
              Overwrite: item.overwrite,
            })
          )
          .catch((e) => {
            if (
              e.message.includes("The parameter already exists.") &&
              item.overwrite === false
            ) {
              Info(
                `${this.storeType}: Update for ${Color(
                  item.name,
                  "Bold"
                )} ${Color(
                  "Skipped",
                  "FgYellow"
                )}. Reason: No Overwrite requested.`
              );
              return;
            } else throw e;
          })
      )
    );
  }

  public Drift(): Object {
    throw new Error(`${this.storeType} - Method not implemented.`);
  }
}
