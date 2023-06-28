"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPubSubServer = void 0;
const pubsub_1 = require("@google-cloud/pubsub");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/microservices/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const gc_pubsub_constants_1 = require("./gc-pubsub.constants");
const gc_pubsub_context_1 = require("./gc-pubsub.context");
const gc_pubsub_utils_1 = require("./gc-pubsub.utils");
class GCPubSubServer extends microservices_1.Server {
    constructor(options) {
        var _a, _b, _c, _d;
        super();
        this.options = options;
        this.logger = new common_1.Logger(GCPubSubServer.name);
        this.client = null;
        this.subscription = null;
        this.clientConfig = this.options.client || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_CLIENT_CONFIG;
        this.topicName = this.options.topic || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_TOPIC;
        this.subscriptionName =
            this.options.subscription || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_SUBSCRIPTION;
        this.subscriberConfig =
            this.options.subscriber || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_SUBSCRIBER_CONFIG;
        this.publisherConfig =
            this.options.publisher || gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_PUBLISHER_CONFIG;
        this.noAck = (_a = this.options.noAck) !== null && _a !== void 0 ? _a : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_NO_ACK;
        this.init = (_b = this.options.init) !== null && _b !== void 0 ? _b : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_INIT;
        this.checkExistence =
            (_c = this.options.checkExistence) !== null && _c !== void 0 ? _c : gc_pubsub_constants_1.GC_PUBSUB_DEFAULT_CHECK_EXISTENCE;
        this.createSubscriptionOptions = this.options.createSubscriptionOptions;
        this.replyTopics = new Set();
        this.autoDeleteSubscriptionOnShutdown =
            (_d = this.options.autoDeleteSubscriptionOnShutdown) !== null && _d !== void 0 ? _d : gc_pubsub_constants_1.GC_AUTO_DELETE_SUBCRIPTION_ON_SHUTDOWN;
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    async listen(callback) {
        this.client = this.createClient();
        const topic = this.client.topic(this.topicName);
        if (this.init) {
            await this.createIfNotExists(topic.create.bind(topic));
        }
        else if (this.checkExistence) {
            const [exists] = await topic.exists();
            if (!exists) {
                const message = `PubSub server is not started: topic ${this.topicName} does not exist`;
                this.logger.error(message);
                throw new Error(message);
            }
        }
        this.subscription = topic.subscription(this.subscriptionName, this.subscriberConfig);
        if (this.init) {
            await this.createIfNotExists(this.subscription.create.bind(this.subscription, this.createSubscriptionOptions));
        }
        else if (this.checkExistence) {
            const [exists] = await this.subscription.exists();
            if (!exists) {
                const message = `PubSub server is not started: subscription ${this.subscriptionName} does not exist`;
                this.logger.error(message);
                throw new Error(message);
            }
        }
        this.subscription
            .on(constants_1.MESSAGE_EVENT, async (message) => {
            await this.handleMessage(message);
            if (this.noAck) {
                message.ack();
            }
        })
            .on(constants_1.ERROR_EVENT, (err) => {
            this.logger.error(err);
        });
        callback();
    }
    async close() {
        if (this.autoDeleteSubscriptionOnShutdown) {
            try {
                await this.subscription.delete();
            }
            catch (_a) {
                await (0, gc_pubsub_utils_1.closeSubscription)(this.subscription);
            }
        }
        else {
            await (0, gc_pubsub_utils_1.closeSubscription)(this.subscription);
        }
        await Promise.all(Array.from(this.replyTopics.values()).map((replyTopic) => {
            return (0, gc_pubsub_utils_1.flushTopic)(this.client.topic(replyTopic));
        }));
        this.replyTopics.clear();
        await (0, gc_pubsub_utils_1.closePubSub)(this.client);
    }
    async handleMessage(message) {
        const { data, attributes, publishTime } = message;
        const rawMessage = JSON.parse(data.toString());
        const now = new Date();
        const packet = this.deserializer.deserialize({
            data: rawMessage,
            id: attributes._id,
            pattern: attributes._pattern,
        });
        const pattern = (0, shared_utils_1.isString)(packet.pattern)
            ? packet.pattern
            : JSON.stringify(packet.pattern);
        const correlationId = packet.id;
        const timeout = +attributes._timeout;
        if (timeout && timeout > 0) {
            if (now.getTime() - publishTime.getTime() >= timeout) {
                const timeoutPacket = {
                    id: correlationId,
                    status: 'error',
                    err: 'Message Timeout',
                };
                return this.sendMessage(timeoutPacket, attributes._replyTo, correlationId, attributes);
            }
        }
        const context = new gc_pubsub_context_1.GCPubSubContext([message, pattern]);
        if ((0, shared_utils_1.isUndefined)(correlationId)) {
            return this.handleEvent(pattern, packet, context);
        }
        const handler = this.getHandlerByPattern(pattern);
        if (!handler) {
            if (!attributes._replyTo) {
                return;
            }
            const status = 'error';
            const noHandlerPacket = {
                id: correlationId,
                status,
                err: constants_1.NO_MESSAGE_HANDLER,
            };
            return this.sendMessage(noHandlerPacket, attributes._replyTo, correlationId, attributes);
        }
        const response$ = this.transformToObservable(await handler(packet.data, context));
        const publish = (data) => this.sendMessage(data, attributes._replyTo, correlationId, attributes);
        response$ && this.send(response$, publish);
    }
    async sendMessage(message, replyTo, id, attributes) {
        Object.assign(message, { id });
        const outgoingResponse = this.serializer.serialize(message);
        this.replyTopics.add(replyTo);
        await this.client.topic(replyTo, this.publisherConfig).publishMessage({
            json: outgoingResponse,
            attributes: Object.assign({ id }, attributes),
        });
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
    createClient() {
        return new pubsub_1.PubSub(this.clientConfig);
    }
}
exports.GCPubSubServer = GCPubSubServer;
//# sourceMappingURL=gc-pubsub.server.js.map