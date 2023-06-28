"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const gc_pubsub_server_1 = require("./gc-pubsub.server");
const constants_1 = require("@nestjs/microservices/constants");
const base_rpc_context_1 = require("@nestjs/microservices/ctx-host/base-rpc.context");
const gc_pubsub_constants_1 = require("./gc-pubsub.constants");
describe('GCPubSubServer', () => {
    let server;
    let pubsub;
    let topicMock;
    let subscriptionMock;
    let createClient;
    let sandbox;
    const objectToMap = (obj) => new Map(Object.keys(obj).map((key) => [key, obj[key]]));
    afterEach(() => {
        sandbox.restore();
    });
    describe('listen', () => {
        describe('when is check existence is true', () => {
            beforeEach(async () => {
                server = getInstance({});
                await server.listen(() => { });
            });
            it('should call "createClient"', () => {
                (0, chai_1.expect)(createClient.called).to.be.true;
            });
            it('should call "client.topic" once', async () => {
                (0, chai_1.expect)(pubsub.topic.called).to.be.true;
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
                server = getInstance({
                    createSubscriptionOptions: mockCreateSubscriptionOptions,
                });
                await server.listen(() => { });
            });
            it('should call "subscription.create" with argument', async () => {
                (0, chai_1.expect)(subscriptionMock.create.calledOnce).to.be.true;
                (0, chai_1.expect)(subscriptionMock.create.calledWith(mockCreateSubscriptionOptions)).to.be.true;
            });
        });
        describe('when is check existence is false', () => {
            beforeEach(async () => {
                server = getInstance({
                    init: false,
                    checkExistence: false,
                });
                await server.listen(() => { });
            });
            it('should call "createClient"', () => {
                (0, chai_1.expect)(createClient.called).to.be.true;
            });
            it('should call "client.topic" once', async () => {
                (0, chai_1.expect)(pubsub.topic.called).to.be.true;
            });
            it('should not call "topic.exists" once', async () => {
                (0, chai_1.expect)(topicMock.exists.called).to.be.false;
            });
            it('should call "topic.subscription" once', async () => {
                (0, chai_1.expect)(topicMock.subscription.called).to.be.true;
            });
            it('should not call "subscription.exists" once', async () => {
                (0, chai_1.expect)(subscriptionMock.exists.called).to.be.false;
            });
            it('should call "subscription.on" twice', async () => {
                (0, chai_1.expect)(subscriptionMock.on.callCount).to.eq(2);
            });
        });
    });
    describe('close', () => {
        beforeEach(async () => {
            server = getInstance({});
            await server.listen(() => { });
            await server.close();
        });
        it('should call "subscription.close"', function () {
            (0, chai_1.expect)(subscriptionMock.close.called).to.be.true;
        });
        it('should close() pubsub', () => {
            (0, chai_1.expect)(pubsub.close.called).to.be.true;
        });
        describe('autoDeleteSubscriptionOnClose is true', () => {
            beforeEach(async () => {
                server = getInstance({
                    autoDeleteSubscriptionOnShutdown: true,
                });
                await server.listen(() => { });
                await server.close();
            });
            it('should delete subscription on close', () => {
                (0, chai_1.expect)(subscriptionMock.delete.calledOnce).to.be.true;
            });
        });
    });
    describe('handleMessage', () => {
        const msg = {
            data: 'tests',
        };
        const messageOptions = {
            ackId: 'id',
            publishTime: new Date(),
            attributes: {
                _replyTo: 'replyTo',
                _id: '3',
                _pattern: 'test',
                _clientId: '4',
            },
            id: 'id',
            received: 0,
            deliveryAttempt: 1,
            ack: () => { },
            modAck: () => { },
            nack: () => { },
            data: Buffer.from(JSON.stringify(msg)),
        };
        beforeEach(async () => {
            server = getInstance({});
            await server.listen(() => { });
        });
        it('should send NO_MESSAGE_HANDLER error if key does not exists in handlers object', async () => {
            await server.handleMessage(messageOptions);
            (0, chai_1.expect)(topicMock.publishMessage.calledWith({
                json: {
                    id: messageOptions.attributes._id,
                    status: 'error',
                    err: constants_1.NO_MESSAGE_HANDLER,
                },
                attributes: Object.assign({ id: messageOptions.attributes._id }, messageOptions.attributes),
            })).to.be.true;
        });
        it('should send TIMEOUT_ERROR_HANDLER if the message is timed out', async () => {
            const timeoutMessageOptions = {
                ackId: 'id',
                publishTime: new Date(Date.now() - 5000),
                attributes: {
                    _replyTo: 'replyTo',
                    _id: '3',
                    _pattern: 'test',
                    _clientId: '4',
                    _timeout: '4000',
                },
                id: 'id',
                received: 0,
                deliveryAttempt: 1,
                ack: () => { },
                modAck: () => { },
                nack: () => { },
                data: Buffer.from(JSON.stringify(msg)),
            };
            await server.handleMessage(timeoutMessageOptions);
            (0, chai_1.expect)(topicMock.publishMessage.calledWith({
                json: {
                    id: timeoutMessageOptions.attributes._id,
                    status: 'error',
                    err: 'Message Timeout',
                },
                attributes: Object.assign({ id: timeoutMessageOptions.attributes._id }, timeoutMessageOptions.attributes),
            })).to.be.true;
        });
        it('should call handler if exists in handlers object', async () => {
            const handler = sinon.spy();
            server.messageHandlers = objectToMap({
                [messageOptions.attributes._pattern]: handler,
            });
            await server.handleMessage(messageOptions);
            (0, chai_1.expect)(handler.calledOnce).to.be.true;
        });
    });
    describe('sendMessage', () => {
        beforeEach(async () => {
            server = getInstance({});
            await server.listen(() => { });
        });
        it('should publish message to indicated topic', async () => {
            const message = { test: true };
            const replyTo = 'test';
            const correlationId = '0';
            await server.sendMessage(message, replyTo, correlationId);
            (0, chai_1.expect)(topicMock.publishMessage.calledWith({
                json: Object.assign(Object.assign({}, message), { id: correlationId }),
                attributes: {
                    id: correlationId,
                },
            })).to.be.true;
        });
    });
    describe('handleEvent', () => {
        const channel = 'test';
        const data = 'test';
        beforeEach(async () => {
            server = getInstance({});
        });
        it('should call handler with expected arguments', () => {
            const handler = sandbox.spy();
            server.messageHandlers = objectToMap({
                [channel]: handler,
            });
            server.handleEvent(channel, { pattern: '', data }, new base_rpc_context_1.BaseRpcContext([]));
            (0, chai_1.expect)(handler.calledWith(data)).to.be.true;
        });
    });
    describe('createIfNotExists', () => {
        it('should throw error', async () => {
            const create = sandbox.stub().rejects({ code: 7 });
            try {
                await server['createIfNotExists'](create);
            }
            catch (error) {
                (0, chai_1.expect)(error).to.include({ code: 7 });
            }
            (0, chai_1.expect)(create.called).to.be.true;
        });
        it('should skip error', async () => {
            const create = sandbox.stub().rejects({ code: gc_pubsub_constants_1.ALREADY_EXISTS });
            await server['createIfNotExists'](create);
            (0, chai_1.expect)(create.called).to.be.true;
        });
    });
    function getInstance(options) {
        const server = new gc_pubsub_server_1.GCPubSubServer(options);
        sandbox = sinon.createSandbox();
        subscriptionMock = {
            create: sandbox.stub().resolves(),
            close: sandbox.stub().callsFake((callback) => callback()),
            on: sandbox.stub().returnsThis(),
            exists: sandbox.stub().resolves([true]),
            delete: sandbox.stub().resolves(),
        };
        topicMock = {
            create: sandbox.stub().resolves(),
            exists: sandbox.stub().resolves([true]),
            flush: sandbox.stub().callsFake((callback) => callback()),
            publishMessage: sandbox.stub().resolves(),
            subscription: sandbox.stub().returns(subscriptionMock),
        };
        pubsub = {
            topic: sandbox.stub().returns(topicMock),
            close: sandbox.stub().callsFake((callback) => callback()),
        };
        createClient = sandbox.stub(server, 'createClient').returns(pubsub);
        return server;
    }
});
//# sourceMappingURL=gc-pubsub.server.spec.js.map