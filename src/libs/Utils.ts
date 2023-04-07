export function isBase64(str: string): boolean {
  const base64RegExp =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
  return base64RegExp.test(str);
}

export function fromEnv(key: string): string {
  if (key.startsWith("env:"))
    return process.env[key.split("env:")[1]] as string;
  else return key;
}

export function deepCopy(body: object): object {
  return JSON.parse(JSON.stringify(body));
}
