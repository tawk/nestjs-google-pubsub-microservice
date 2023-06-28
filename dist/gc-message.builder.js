"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPubSubMessageBuilder = exports.GCPubSubMessage = void 0;
class GCPubSubMessage {
    constructor(json, attributes, orderingKey) {
        this.json = json;
        this.attributes = attributes;
        this.orderingKey = orderingKey;
    }
}
exports.GCPubSubMessage = GCPubSubMessage;
class GCPubSubMessageBuilder {
    constructor(data, attributes = {}, orderingKey, timeout = 0) {
        this.data = data;
        this.attributes = attributes;
        this.orderingKey = orderingKey;
        this.timeout = timeout;
    }
    setAttributes(attributes) {
        this.attributes = attributes;
        return this;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    setOrderingKey(orderingKey) {
        this.orderingKey = orderingKey;
        return this;
    }
    setTimeout(ms) {
        this.timeout = ms;
        return this;
    }
    build() {
        if (!this.data)
            throw new Error('Missing Data');
        if (this.timeout < 0)
            throw new Error('Invalid Timeout Value');
        else if (this.timeout > 0)
            this.attributes._timeout = String(this.timeout);
        return new GCPubSubMessage(this.data, this.attributes, this.orderingKey);
    }
}
exports.GCPubSubMessageBuilder = GCPubSubMessageBuilder;
//# sourceMappingURL=gc-message.builder.js.map