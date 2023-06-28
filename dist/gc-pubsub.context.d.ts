import { Message } from '@google-cloud/pubsub';
import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';
type GCPubSubContextArgs = [Message, string];
export declare class GCPubSubContext extends BaseRpcContext<GCPubSubContextArgs> {
  constructor(args: GCPubSubContextArgs);
  getMessage(): Message;
  getPattern(): string;
}
export {};
