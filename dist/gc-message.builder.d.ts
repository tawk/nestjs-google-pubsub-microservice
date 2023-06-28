export declare class GCPubSubMessage<TData = any, TAttrs = any> {
  readonly json: TData;
  readonly attributes: TAttrs;
  readonly orderingKey: string | undefined;
  constructor(json: TData, attributes: TAttrs, orderingKey: string | undefined);
}
type Stringify<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : never;
};
export declare class GCPubSubMessageBuilder<
  TData,
  TAttrs extends Stringify<TAttrs> = Record<string, string>,
> {
  private data?;
  private attributes;
  private orderingKey?;
  private timeout;
  constructor(
    data?: TData,
    attributes?: Partial<TAttrs>,
    orderingKey?: string,
    timeout?: number,
  );
  setAttributes(attributes: TAttrs): this;
  setData(data: TData): this;
  setOrderingKey(orderingKey: string): this;
  setTimeout(ms: number): this;
  build(): GCPubSubMessage<TData, TAttrs>;
}
export {};
