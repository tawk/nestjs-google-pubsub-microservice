/// <reference types="node" />
/// <reference types="node" />
import {
  ClientConfig,
  CreateSubscriptionOptions,
  PubSub,
  Subscription,
  Topic,
} from '@google-cloud/pubsub';
import { PublishOptions } from '@google-cloud/pubsub/build/src/publisher';
import { SubscriberOptions } from '@google-cloud/pubsub/build/src/subscriber';
import { Logger } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { GCPubSubOptions } from './gc-pubsub.interface';
import { UUID } from 'crypto';
export declare class GCPubSubClient extends ClientProxy {
  protected readonly options: GCPubSubOptions;
  readonly clientId: UUID;
  protected readonly logger: Logger;
  protected readonly topicName: string;
  protected readonly publisherConfig: PublishOptions;
  protected readonly replyTopicName?: string;
  protected readonly replySubscriptionName?: string;
  protected readonly clientConfig: ClientConfig;
  protected readonly subscriberConfig: SubscriberOptions;
  protected readonly noAck: boolean;
  protected readonly autoResume: boolean;
  protected readonly createSubscriptionOptions: CreateSubscriptionOptions;
  protected readonly autoDeleteSubscriptionOnShutdown: boolean;
  protected readonly clientIdFilter: boolean;
  client: PubSub | null;
  replySubscription: Subscription | null;
  topic: Topic | null;
  protected init: boolean;
  protected readonly checkExistence: boolean;
  constructor(options: GCPubSubOptions);
  getRequestPattern(pattern: string): string;
  close(): Promise<void>;
  connect(): Promise<PubSub>;
  createClient(): PubSub;
  protected dispatchEvent(packet: ReadPacket): Promise<any>;
  protected publish(
    partialPacket: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => boolean;
  protected initializeSerializer(options: GCPubSubOptions): void;
  handleResponse(message: {
    data: Buffer;
    attributes: Record<string, string>;
  }): Promise<boolean>;
  createIfNotExists(create: () => Promise<any>): Promise<void>;
}
