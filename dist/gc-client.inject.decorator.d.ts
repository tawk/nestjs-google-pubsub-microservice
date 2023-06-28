export declare const getGCPubSubClientToken: (name: string) => string;
export declare const InjectGCPubSubClient: (
  name: string,
) => (target: object, key: string | symbol, index?: number) => void;
