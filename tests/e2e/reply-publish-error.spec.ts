import { PubSub, Subscription } from '@google-cloud/pubsub';
import { expect } from 'chai';
import { GCPubSubServer } from '../../lib';

const ALREADY_EXISTS = 6;
const apiEndpoint = 'localhost:8085';
const projectId = 'test-project-id';
const requestTopicName = 'reply-error-test-topic';
const requestSubName = 'reply-error-test-sub';
const validReplyTopicName = 'reply-error-test-valid-reply';
const validReplySubName = 'reply-error-test-valid-reply-sub';

async function ensureTopic(pubsub: PubSub, name: string) {
  try {
    await pubsub.topic(name).create();
  } catch (err: any) {
    if (err.code !== ALREADY_EXISTS) throw err;
  }
}

async function ensureSubscription(
  pubsub: PubSub,
  topicName: string,
  subName: string,
) {
  try {
    await pubsub.topic(topicName).subscription(subName).create();
  } catch (err: any) {
    if (err.code !== ALREADY_EXISTS) throw err;
  }
}

describe('GCPubSubServer reply publishing error handling', () => {
  let pubServer: GCPubSubServer;
  let pubsub: PubSub;
  let replySubscription: Subscription;
  let receivedReplies: Array<{ id: string }>;

  beforeEach(async () => {
    pubsub = new PubSub({ apiEndpoint, projectId });
    receivedReplies = [];

    await ensureTopic(pubsub, validReplyTopicName);
    await ensureSubscription(pubsub, validReplyTopicName, validReplySubName);

    replySubscription = pubsub.subscription(validReplySubName);
    replySubscription.on('error', () => {});
    replySubscription.on('message', (msg) => {
      receivedReplies.push({ id: msg.attributes.id });
      msg.ack();
    });

    pubServer = new GCPubSubServer({
      topic: requestTopicName,
      subscription: requestSubName,
      client: { apiEndpoint, projectId },
      init: true,
    });

    (pubServer as any).messageHandlers = new Map([
      ['echo', async () => ({ ok: true })],
    ]);

    await new Promise<void>((resolve, reject) => {
      pubServer.listen((err?: unknown) => (err ? reject(err) : resolve()));
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) =>
      replySubscription.close(() => resolve()),
    );
    await pubServer.close();
    try {
      await pubsub.subscription(validReplySubName).delete();
    } catch {}
    try {
      await pubsub.subscription(requestSubName).delete();
    } catch {}
    try {
      await pubsub.topic(validReplyTopicName).delete();
    } catch {}
    try {
      await pubsub.topic(requestTopicName).delete();
    } catch {}
    await pubsub.close();
  });

  it('survives a missing reply topic and still serves subsequent valid requests', async () => {
    await pubsub.topic(requestTopicName).publishMessage({
      data: Buffer.from(JSON.stringify({ payload: 'first' })),
      attributes: {
        _id: 'bad-1',
        _pattern: 'echo',
        _replyTo: `definitely-does-not-exist-${Date.now()}`,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    await pubsub.topic(requestTopicName).publishMessage({
      data: Buffer.from(JSON.stringify({ payload: 'second' })),
      attributes: {
        _id: 'good-1',
        _pattern: 'echo',
        _replyTo: validReplyTopicName,
      },
    });

    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      if (receivedReplies.some((r) => r.id === 'good-1')) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect.fail('Did not receive reply for good-1 within timeout');
  }, 15000);
});
