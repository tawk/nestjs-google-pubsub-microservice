"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPubSubClient = void 0;
const pubsub_1 = require("@google-cloud/pubsub");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const constants_1 = require("@nestjs/microservices/constants");
const gc_pubsub_constants_1 = require("./gc-pubsub.constants");
const gc_pubsub_utils_1 = require("./gc-pubsub.utils");
const crypto_1 = require("crypto");
const gc_message_serializer_1 = require("./gc-message.serializer");
class GCPubSubClient extends microservices_1.ClientProxy {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g;
        super();
        this.options = options;
        this.logger = new common_1.Logger(GCPubSubClient.name);
        this.client = null;
        this.replySubscription = null;
        this.topic = null;
        this.clientId = (0, crypto_1.randomUUID)();
        this.clientConfig = this.options.client || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_CLIENT_CONFIG;
        this.topicName = this.options.topic || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_TOPIC;
        this.subscriberConfig =
            this.options.subscriber || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_SUBSCRIBER_CONFIG;
        this.publisherConfig =
            this.options.publisher || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_PUBLISHER_CONFIG;
        this.replyTopicName = this.options.replyTopic;
        this.replySubscriptionName = this.options.replySubscription;
        if (this.options.appendClientIdToSubscription)
            this.replySubscriptionName += '-' + this.clientId;
        this.noAck = (_a = this.options.noAck) !== null && _a !== void 0 ? _a : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_NO_ACK;
        this.init = (_b = this.options.init) !== null && _b !== void 0 ? _b : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_INIT;
        this.checkExistence =
            (_c = this.options.checkExistence) !== null && _c !== void 0 ? _c : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_CHECK_EXISTENCE;
        this.autoResume = (_d = this.options.autoResume) !== null && _d !== void 0 ? _d : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_AUTO_RESUME;
        this.createSubscriptionOptions =
            (_e = this.options.createSubscriptionOptions) !== null && _e !== void 0 ? _e : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_CREATE_SUBSCRIPTION_OPTIONS;
        this.autoDeleteSubscriptionOnShutdown =
            (_f = this.options.autoDeleteSubscriptionOnShutdown) !== null && _f !== void 0 ? _f : gc_pubsub_constants_1.GC_AUTO_DELETE_SUBCRIPTION_ON_SHUTDOWN;
        this.clientIdFilter =
            (_g = this.options.clientIdFilter) !== null && _g !== void 0 ? _g : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_CLIENT_ID_FILTER;
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    getRequestPattern(pattern) {
        return pattern;
    }
    async close() {
        await (0, gc_pubsub_utils_1.flushTopic)(this.topic);
        if (this.autoDeleteSubscriptionOnShutdown) {
            try {
                await this.replySubscription.delete();
            }
            catch (_a) {
                await (0, gc_pubsub_utils_1.closeSubscription)(this.replySubscription);
            }
        }
        else {
            await (0, gc_pubsub_utils_1.closeSubscription)(this.replySubscription);
        }
        await (0, gc_pubsub_utils_1.closePubSub)(this.client);
        this.client = null;
        this.topic = null;
        this.replySubscription = null;
    }
    async connect() {
        var _a, _b;
        if (this.client) {
            return this.client;
        }
        this.client = this.createClient();
        this.topic = this.client.topic(this.topicName, this.publisherConfig);
        if (this.checkExistence) {
            const [topicExists] = await this.topic.exists();
            if (!topicExists) {
                const message = `PubSub client is not connected: topic ${this.topicName} does not exist`;
                this.logger.error(message);
                throw new Error(message);
            }
        }
        if (this.replyTopicName && this.replySubscriptionName) {
            const replyTopic = this.client.topic(this.replyTopicName);
            if (this.init) {
                await this.createIfNotExists(replyTopic.create.bind(replyTopic));
            }
            else if (this.checkExistence) {
                const [exists] = await replyTopic.exists();
                if (!exists) {
                    const message = `PubSub client is not connected: topic ${this.replyTopicName} does not exist`;
                    this.logger.error(message);
                    throw new Error(message);
                }
            }
            this.replySubscription = replyTopic.subscription(this.replySubscriptionName, this.subscriberConfig);
            if (this.init) {
                let filterString = (_b = (_a = this.createSubscriptionOptions) === null || _a === void 0 ? void 0 : _a.filter) !== null && _b !== void 0 ? _b : '';
                if (this.clientIdFilter) {
                    const temp = filterString;
                    filterString = `attributes._clientId = "${this.clientId}"`;
                    if (temp !== '')
                        filterString += ` AND (${temp})`;
                }
                await this.createIfNotExists(this.replySubscription.create.bind(this.replySubscription, Object.assign(Object.assign({}, this.createSubscriptionOptions), (this.clientIdFilter && {
                    filter: filterString,
                }))));
            }
            else if (this.checkExistence) {
                const [exists] = await this.replySubscription.exists();
                if (!exists) {
                    const message = `PubSub client is not connected: subscription ${this.replySubscription} does not exist`;
                    this.logger.error(message);
                    throw new Error(message);
                }
            }
            this.replySubscription
                .on(constants_1.MESSAGE_EVENT, async (message) => {
                try {
                    await this.handleResponse(message);
                    message.ack();
                }
                catch (error) {
                    this.logger.error(error);
                }
            })
                .on(constants_1.ERROR_EVENT, (err) => this.logger.error(err));
        }
        return this.client;
    }
    createClient() {
        return new pubsub_1.PubSub(this.clientConfig);
    }
    async dispatchEvent(packet) {
        var _a, _b;
        const pattern = this.normalizePattern(packet.pattern);
        if (!this.topic) {
            return;
        }
        const serializedPacket = this.serializer.serialize(Object.assign(Object.assign({}, packet), { pattern }));
        const attributes = Object.assign({ _replyTo: this.replyTopicName, _pattern: this.getRequestPattern(packet.pattern) }, (((_a = serializedPacket.json) === null || _a === void 0 ? void 0 : _a.attributes) &&
            ((_b = serializedPacket.json) === null || _b === void 0 ? void 0 : _b.attributes)));
        await this.topic.publishMessage({
            json: serializedPacket.json,
            orderingKey: serializedPacket.orderingKey,
            attributes: attributes,
        });
    }
    publish(partialPacket, callback) {
        try {
            const packet = this.assignPacketId(partialPacket);
            const serializedPacket = this.serializer.serialize(packet);
            const attributes = Object.assign({ _replyTo: this.replyTopicName, _pattern: JSON.stringify(this.getRequestPattern(packet.pattern)), _id: packet.id, _clientId: this.clientId }, (serializedPacket.attributes && serializedPacket.attributes));
            this.routingMap.set(packet.id, callback);
            if (this.topic) {
                this.topic
                    .publishMessage({
                    json: serializedPacket.json,
                    orderingKey: serializedPacket.orderingKey,
                    attributes: attributes,
                })
                    .catch((err) => {
                    if (this.autoResume && serializedPacket.orderingKey) {
                        this.topic.resumePublishing(serializedPacket.orderingKey);
                    }
                    callback({ err });
                });
            }
            else {
                callback({ err: new Error('Topic is not created') });
            }
            if (serializedPacket.attributes._timeout) {
                setTimeout(() => {
                    this.routingMap.delete(packet.id);
                }, Number(serializedPacket.attributes._timeout));
            }
            return () => this.routingMap.delete(packet.id);
        }
        catch (err) {
            callback({ err });
        }
    }
    initializeSerializer(options) {
        var _a;
        this.serializer = (_a = options === null || options === void 0 ? void 0 : options.serializer) !== null && _a !== void 0 ? _a : new gc_message_serializer_1.GCPubSubMessageSerializer();
    }
    async handleResponse(message) {
        const rawMessage = JSON.parse(message.data.toString());
        const { err, response, isDisposed, id } = this.deserializer.deserialize(rawMessage);
        const correlationId = message.attributes._id || id;
        const callback = this.routingMap.get(correlationId);
        if (!callback) {
            return false;
        }
        if (err || isDisposed) {
            callback({
                err,
                response,
                isDisposed,
            });
        }
        else {
            callback({
                err,
                response,
            });
        }
        return true;
    }
    async createIfNotExists(create) {
        try {
            await create();
        }
        catch (error) {
            if (error.code !== gc_pubsub_constants_1.ALREADY_EXISTS) {
                throw error;
            }
        }
    }
}
exports.GCPubSubClient = GCPubSubClient;
//# sourceMappingURL=gc-pubsub.client.js.map