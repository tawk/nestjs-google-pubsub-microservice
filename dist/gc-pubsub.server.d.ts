import {
  ClientConfig,
  CreateSubscriptionOptions,
  Message,
  PubSub,
  Subscription,
} from '@google-cloud/pubsub';
import { PublishOptions } from '@google-cloud/pubsub/build/src/publisher';
import { SubscriberOptions } from '@google-cloud/pubsub/build/src/subscriber';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { GCPubSubOptions } from './gc-pubsub.interface';
export declare class GCPubSubServer
  extends Server
  implements CustomTransportStrategy
{
  protected readonly options: GCPubSubOptions;
  protected logger: Logger;
  protected readonly clientConfig: ClientConfig;
  protected readonly topicName: string;
  protected readonly publisherConfig: PublishOptions;
  protected readonly subscriptionName: string;
  protected readonly subscriberConfig: SubscriberOptions;
  protected readonly noAck: boolean;
  protected readonly replyTopics: Set<string>;
  protected readonly init: boolean;
  protected readonly checkExistence: boolean;
  protected readonly createSubscriptionOptions: CreateSubscriptionOptions;
  protected readonly autoDeleteSubscriptionOnShutdown: boolean;
  client: PubSub | null;
  subscription: Subscription | null;
  constructor(options: GCPubSubOptions);
  listen(callback: () => void): Promise<void>;
  close(): Promise<void>;
  handleMessage(message: Message): Promise<any>;
  sendMessage<T = any>(
    message: T,
    replyTo: string,
    id: string,
    attributes?: Record<string, string>,
  ): Promise<void>;
  createIfNotExists(create: () => Promise<any>): Promise<void>;
  createClient(): PubSub;
}
