"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const gc_pubsub_constants_1 = require("./gc-pubsub.constants");
const gc_pubsub_client_1 = require("./gc-pubsub.client");
const gc_message_builder_1 = require("./gc-message.builder");
describe('GCPubSubClient', () => {
    let client;
    let pubsub;
    let topicMock;
    let subscriptionMock;
    let createClient;
    let sandbox;
    let clock;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        clock = sandbox.useFakeTimers();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('connect', () => {
        describe('when is not connected', () => {
            describe('when check existence is true', () => {
                beforeEach(async () => {
                    client = getInstance({
                        replyTopic: 'replyTopic',
                        replySubscription: 'replySubcription',
                    });
                    try {
                        client['client'] = null;
                        await client.connect();
                    }
                    catch (_a) { }
                });
                it('should call "createClient" once', async () => {
                    (0, chai_1.expect)(createClient.called).to.be.true;
                });
                it('should call "client.topic" once', async () => {
                    (0, chai_1.expect)(pubsub.topic.called).to.be.true;
                });
                it('should call "topic.exists" once', async () => {
                    (0, chai_1.expect)(topicMock.exists.called).to.be.true;
                });
                it('should call "topic.create" once', async () => {
                    (0, chai_1.expect)(topicMock.create.called).to.be.true;
                });
                it('should call "topic.subscription" once', async () => {
                    (0, chai_1.expect)(topicMock.subscription.called).to.be.true;
                });
                it('should call "subscription.create" once', async () => {
                    (0, chai_1.expect)(subscriptionMock.create.called).to.be.true;
                });
                it('should call "subscription.on" twice', async () => {
                    (0, chai_1.expect)(subscriptionMock.on.callCount).to.eq(2);
                });
            });
            describe('when createSubscriptionOptions is provided', () => {
                const mockCreateSubscriptionOptions = {
                    messageRetentionDuration: {
                        seconds: 604800,
                    },
                    pushEndpoint: 'https://example.com/push',
                    oidcToken: {
                        serviceAccountEmail: 'example@example.com',
                        audience: 'https://example.com',
                    },
                    topic: 'projects/my-project/topics/my-topic',
                    pushConfig: {
                        pushEndpoint: 'https://example.com/push',
                    },
                    ackDeadlineSeconds: 60,
                    retainAckedMessages: true,
                    labels: {
                        env: 'dev',
                        version: '1.0.0',
                    },
                    enableMessageOrdering: false,
                    expirationPolicy: {
                        ttl: {
                            seconds: 86400,
                        },
                    },
                    filter: 'attribute.type = "order"',
                    deadLetterPolicy: {
                        deadLetterTopic: 'projects/my-project/topics/my-dead-letter-topic',
                        maxDeliveryAttempts: 5,
                    },
                    retryPolicy: {
                        minimumBackoff: {
                            seconds: 10,
                        },
                        maximumBackoff: {
                            seconds: 300,
                        },
                    },
                    detached: false,
                    enableExactlyOnceDelivery: true,
                    topicMessageRetentionDuration: {
                        seconds: 2592000,
                    },
                    state: 'ACTIVE',
                };
                beforeEach(async () => {
                    client = getInstance({
                        createSubscriptionOptions: mockCreateSubscriptionOptions,
                        replySubscription: 'testSubscription',
                        replyTopic: 'testTopic',
                        checkExistence: true,
                        init: true,
                    });
                    await client.connect();
                });
                it('should call "subscription.create" with argument', async () => {
                    (0, chai_1.expect)(subscriptionMock.create.calledOnce).to.be.true;
                    (0, chai_1.expect)(subscriptionMock.create.calledWith(mockCreateSubscriptionOptions)).to.be.true;
                });
            });
            describe('when clientIdFilter is turned on', () => {
                const mockCreateSubscriptionOptions = {
                    messageRetentionDuration: {
                        seconds: 604800,
                    },
                    pushEndpoint: 'https://example.com/push',
                    oidcToken: {
                        serviceAccountEmail: 'example@example.com',
                        audience: 'https://example.com',
                    },
                    topic: 'projects/my-project/topics/my-topic',
                    pushConfig: {
                        pushEndpoint: 'https://example.com/push',
                    },
                    ackDeadlineSeconds: 60,
                    retainAckedMessages: true,
                    labels: {
                        env: 'dev',
                        version: '1.0.0',
                    },
                    enableMessageOrdering: false,
                    expirationPolicy: {
                        ttl: {
                            seconds: 86400,
                        },
                    },
                    filter: 'attribute.type = "order"',
                    deadLetterPolicy: {
                        deadLetterTopic: 'projects/my-project/topics/my-dead-letter-topic',
                        maxDeliveryAttempts: 5,
                    },
                    retryPolicy: {
                        minimumBackoff: {
                            seconds: 10,
                        },
                        maximumBackoff: {
                            seconds: 300,
                        },
                    },
                    detached: false,
                    enableExactlyOnceDelivery: true,
                    topicMessageRetentionDuration: {
                        seconds: 2592000,
                    },
                    state: 'ACTIVE',
                };
                beforeEach(async () => {
                    client = getInstance({
                        createSubscriptionOptions: mockCreateSubscriptionOptions,
                        replySubscription: 'testSubscription',
                        replyTopic: 'testTopic',
                        checkExistence: true,
                        init: true,
                        clientIdFilter: true,
                    });
                    await client.connect();
                });
                it('should call subscription.create with client id filter', async () => {
                    const expectedArgs = Object.assign(Object.assign({}, mockCreateSubscriptionOptions), { filter: `attributes._clientId = "${client.clientId}" AND (${mockCreateSubscriptionOptions.filter})` });
                    (0, chai_1.expect)(subscriptionMock.create.calledOnce).to.be.true;
                    (0, chai_1.expect)(subscriptionMock.create.calledWith(expectedArgs)).to.be.true;
                });
                it('should call subscription.create with client id filter with empty filter', async () => {
                    client = getInstance({
                        replySubscription: 'testSubscription',
                        replyTopic: 'testTopic',
                        checkExistence: true,
                        init: true,
                        clientIdFilter: true,
                    });
                    await client.connect();
                    const expectedArgs = {
                        filter: `attributes._clientId = "${client.clientId}"`,
                    };
                    (0, chai_1.expect)(subscriptionMock.create.calledOnce).to.be.true;
                    (0, chai_1.expect)(subscriptionMock.create.calledWith(expectedArgs)).to.be.true;
                });
                it('should call not subscription.create with client id when clientIdFilter is off', async () => {
                    client = getInstance({
                        replySubscription: 'testSubscription',
                        replyTopic: 'testTopic',
                        checkExistence: true,
                        init: true,
                    });
                    await client.connect();
                    (0, chai_1.expect)(subscriptionMock.create.calledOnce).to.be.true;
                    (0, chai_1.expect)(subscriptionMock.create.calledWith()).to.be.true;
                });
            });
            describe('when check existence is false', () => {
                beforeEach(async () => {
                    client = getInstance({
                        replyTopic: 'replyTopic',
                        replySubscription: 'replySubscription',
                        init: false,
                        checkExistence: false,
                    });
                    try {
                        client['client'] = null;
                        await client.connect();
                    }
                    catch (_a) { }
                });
                it('should call "createClient" once', () => {
                    (0, chai_1.expect)(createClient.called).to.be.true;
                });
                it('should call "client.topic" once', () => {
                    (0, chai_1.expect)(pubsub.topic.called).to.be.true;
                });
                it('should not call "topic.exists" once', () => {
                    (0, chai_1.expect)(topicMock.exists.called).to.be.false;
                });
                it('should not call "topic.create" once', () => {
                    (0, chai_1.expect)(topicMock.create.called).to.be.false;
                });
                it('should call "topic.subscription" once', () => {
                    (0, chai_1.expect)(topicMock.subscription.called).to.be.true;
                });
                it('should not call "subscription.exists" once', () => {
                    (0, chai_1.expect)(subscriptionMock.exists.called).to.be.false;
                });
                it('should call "subscription.on" twice', () => {
                    (0, chai_1.expect)(subscriptionMock.on.callCount).to.eq(2);
                });
            });
        });
        describe('when is connected', () => {
            beforeEach(async () => {
                client = getInstance({
                    replyTopic: 'replyTopic',
                    replySubscription: 'replySubscription',
                    appendClientIdToSubscription: true,
                });
                try {
                    client['client'] = pubsub;
                    await client.connect();
                }
                catch (_a) { }
            });
            it('should not call "createClient"', async () => {
                (0, chai_1.expect)(createClient.called).to.be.false;
            });
            it('should not call "client.topic"', async () => {
                (0, chai_1.expect)(pubsub.topic.called).to.be.false;
            });
            it('should not call "topic.create"', async () => {
                (0, chai_1.expect)(topicMock.create.called).to.be.false;
            });
            it('should not call "topic.subscription"', async () => {
                (0, chai_1.expect)(topicMock.subscription.called).to.be.false;
            });
            it('should not call "subscription.create"', async () => {
                (0, chai_1.expect)(subscriptionMock.create.called).to.be.false;
            });
            it('should not call "subscription.on"', async () => {
                (0, chai_1.expect)(subscriptionMock.on.callCount).to.eq(0);
            });
            describe('when appendClientIdToSubcription is true', () => {
                it('should appeand clientId to subscription name', () => {
                    (0, chai_1.expect)(client['replySubscriptionName']).to.equal(`replySubscription-${client.clientId}`);
                });
            });
        });
    });
    describe('publish', () => {
        beforeEach(() => {
            client = getInstance({
                replyTopic: 'replyTopic',
                replySubscription: 'replySubcription',
                autoResume: true,
            });
            client.topic = topicMock;
            topicMock.publishMessage = sinon.stub().resolves();
        });
        const pattern = 'test';
        const msg = { pattern, data: 'data' };
        it('should send message to a proper topic', () => {
            client['publish'](msg, () => { });
            const message = topicMock.publishMessage.getCall(0).args[0];
            (0, chai_1.expect)(topicMock.publishMessage.called).to.be.true;
            (0, chai_1.expect)(message.json).to.be.eql(msg.data);
        });
        it('should remove listener from routing map on dispose', () => {
            client['publish'](msg, () => ({}))();
            (0, chai_1.expect)(client['routingMap'].size).to.be.eq(0);
        });
        it('should call callback on error', () => {
            const callback = sandbox.spy();
            sinon.stub(client, 'assignPacketId').callsFake(() => {
                throw new Error();
            });
            client['publish'](msg, callback);
            (0, chai_1.expect)(callback.called).to.be.true;
            (0, chai_1.expect)(callback.getCall(0).args[0].err).to.be.instanceof(Error);
        });
        it('should call resumePublishing on error with ordering key', (done) => {
            topicMock.publishMessage = sinon.stub().rejects();
            const message = {
                data: new gc_message_builder_1.GCPubSubMessageBuilder('data').setOrderingKey('asdf').build(),
                pattern: 'test',
            };
            client['publish'](message, () => {
                (0, chai_1.expect)(topicMock.resumePublishing.called).to.be.true;
                done();
            });
        });
        it('should send message to a proper topic', () => {
            client['publish'](msg, () => { });
            (0, chai_1.expect)(topicMock.publishMessage.called).to.be.true;
            const message = topicMock.publishMessage.getCall(0).args[0];
            (0, chai_1.expect)(message.json).to.be.eql(msg.data);
            (0, chai_1.expect)(message.attributes._pattern).to.be.eql(JSON.stringify(pattern));
            (0, chai_1.expect)(message.attributes._id).to.be.not.empty;
        });
        it('should setTimeout to delete callback when timeout is provided', () => {
            const message = {
                data: new gc_message_builder_1.GCPubSubMessageBuilder('data')
                    .setOrderingKey('asdf')
                    .setTimeout(500)
                    .build(),
                pattern: 'test',
            };
            client['publish'](message, () => { });
            const routingMapDelete = sinon.spy(client['routingMap'], 'delete');
            clock.tick(510);
            (0, chai_1.expect)(routingMapDelete.calledOnce).to.be.true;
        });
    });
    describe('handleResponse', () => {
        let callback;
        const id = '1';
        beforeEach(() => {
            callback = sandbox.spy();
        });
        describe('when disposed', () => {
            beforeEach(() => {
                client['routingMap'].set(id, callback);
                client.handleResponse({
                    data: Buffer.from(JSON.stringify({ id, isDisposed: true })),
                    attributes: {},
                });
            });
            it('should emit disposed callback', () => {
                (0, chai_1.expect)(callback.called).to.be.true;
                (0, chai_1.expect)(callback.calledWith({
                    err: undefined,
                    response: undefined,
                    isDisposed: true,
                })).to.be.true;
            });
        });
        describe('when not disposed', () => {
            let buffer;
            beforeEach(() => {
                buffer = { id, err: undefined, response: 'res' };
                client['routingMap'].set(id, callback);
                client.handleResponse({
                    data: Buffer.from(JSON.stringify(buffer)),
                    attributes: {},
                });
            });
            it('should not close server', () => {
                (0, chai_1.expect)(pubsub.close.called).to.be.false;
            });
            it('should call callback with error and response data', () => {
                (0, chai_1.expect)(callback.called).to.be.true;
                (0, chai_1.expect)(callback.calledWith({
                    err: buffer.err,
                    response: buffer.response,
                })).to.be.true;
            });
        });
    });
    describe('close', () => {
        beforeEach(async () => {
            client = getInstance({
                replyTopic: 'replyTopic',
                replySubscription: 'replySubcription',
            });
            await client.connect();
            await client.close();
        });
        it('should call "replySubscription.close"', function () {
            (0, chai_1.expect)(subscriptionMock.close.called).to.be.true;
        });
        it('should close() pubsub', () => {
            (0, chai_1.expect)(pubsub.close.called).to.be.true;
        });
        it('should set "client" to null', () => {
            (0, chai_1.expect)(client.client).to.be.null;
        });
        it('should set "topic" to null', () => {
            (0, chai_1.expect)(client.topic).to.be.null;
        });
        it('should set "replySubscription" to null', () => {
            (0, chai_1.expect)(client.replySubscription).to.be.null;
        });
        describe('autoDeleteSubscriptionOnClose is true', () => {
            beforeEach(async () => {
                client = getInstance({
                    autoDeleteSubscriptionOnShutdown: true,
                    replyTopic: 'replyTopic',
                    replySubscription: 'replySubcription',
                });
                await client.connect();
                await client.close();
            });
            it('should delete subscription on close', () => {
                (0, chai_1.expect)(subscriptionMock.delete.calledOnce).to.be.true;
            });
        });
    });
    describe('dispatchEvent', () => {
        const msg = { pattern: 'pattern', data: 'data' };
        beforeEach(() => {
            client = getInstance({
                replyTopic: 'replyTopic',
                replySubscription: 'replySubcription',
            });
            client.topic = topicMock;
        });
        it('should publish packet', async () => {
            await client['dispatchEvent'](msg);
            (0, chai_1.expect)(topicMock.publishMessage.called).to.be.true;
        });
        it('should publish packet with proper data', async () => {
            await client['dispatchEvent'](msg);
            (0, chai_1.expect)(topicMock.publishMessage.getCall(0).args[0].json).to.be.eql(msg.data);
        });
        it('should throw error', async () => {
            topicMock.publishMessage.callsFake((a, b, c, d) => d(new Error()));
            client['dispatchEvent'](msg).catch((err) => (0, chai_1.expect)(err).to.be.instanceOf(Error));
        });
        it('should publish packet', async () => {
            await client['dispatchEvent'](msg);
            (0, chai_1.expect)(topicMock.publishMessage.called).to.be.true;
        });
        it('should publish packet with proper data', async () => {
            await client['dispatchEvent'](msg);
            const message = topicMock.publishMessage.getCall(0).args[0];
            (0, chai_1.expect)(message.json).to.be.eql(msg.data);
            (0, chai_1.expect)(message.attributes._pattern).to.be.eql(msg.pattern);
        });
        it('should throw error', async () => {
            topicMock.publishMessage.callsFake((a, b, c, d) => d(new Error()));
            client['dispatchEvent'](msg).catch((err) => (0, chai_1.expect)(err).to.be.instanceOf(Error));
        });
    });
    describe('createIfNotExists', () => {
        it('should throw error', async () => {
            const create = sandbox.stub().rejects({ code: 7 });
            try {
                await client['createIfNotExists'](create);
            }
            catch (error) {
                (0, chai_1.expect)(error).to.include({ code: 7 });
            }
            (0, chai_1.expect)(create.called).to.be.true;
        });
        it('should skip error', async () => {
            const create = sandbox.stub().rejects({ code: gc_pubsub_constants_1.ALREADY_EXISTS });
            await client['createIfNotExists'](create);
            (0, chai_1.expect)(create.called).to.be.true;
        });
    });
    function getInstance(options) {
        const client = new gc_pubsub_client_1.GCPubSubClient(options);
        subscriptionMock = {
            create: sandbox.stub().resolves(),
            close: sandbox.stub().callsFake((callback) => callback()),
            on: sandbox.stub().returnsThis(),
            exists: sandbox.stub().resolves([true]),
            delete: sandbox.stub().resolves(),
        };
        topicMock = {
            create: sandbox.stub().resolves(),
            flush: sandbox.stub().callsFake((callback) => callback()),
            publishMessage: sandbox.stub().resolves(),
            exists: sandbox.stub().resolves([true]),
            subscription: sandbox.stub().returns(subscriptionMock),
            resumePublishing: sinon.stub().resolves(),
        };
        pubsub = {
            topic: sandbox.stub().callsFake(() => topicMock),
            close: sandbox.stub().callsFake((callback) => callback()),
        };
        createClient = sandbox.stub(client, 'createClient').callsFake(() => pubsub);
        return client;
    }
});
//# sourceMappingURL=gc-pubsub.client.spec.js.map