"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flushTopic = exports.closePubSub = exports.closeSubscription = void 0;
async function closeSubscription(subscription) {
    if (!subscription) {
        return;
    }
    return new Promise((resolve) => {
        subscription.close(() => resolve());
    });
}
exports.closeSubscription = closeSubscription;
async function closePubSub(pubsub) {
    if (!pubsub) {
        return;
    }
    return new Promise((resolve) => {
        pubsub.close(() => resolve());
    });
}
exports.closePubSub = closePubSub;
async function flushTopic(topic) {
    if (!topic) {
        return;
    }
    return new Promise((resolve) => {
        topic.flush(() => resolve());
    });
}
exports.flushTopic = flushTopic;
//# sourceMappingURL=gc-pubsub.utils.js.map