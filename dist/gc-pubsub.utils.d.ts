import { PubSub, Subscription, Topic } from '@google-cloud/pubsub';
export declare function closeSubscription(
  subscription: Subscription | null,
): Promise<void>;
export declare function closePubSub(pubsub: PubSub | null): Promise<void>;
export declare function flushTopic(topic: Topic | null): Promise<void>;
