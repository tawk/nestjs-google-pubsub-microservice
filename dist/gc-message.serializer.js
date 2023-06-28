"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPubSubMessageSerializer = void 0;
const gc_message_builder_1 = require("./gc-message.builder");
class GCPubSubMessageSerializer {
    constructor() { }
    serialize(packet) {
        let message;
        if (packet.data instanceof gc_message_builder_1.GCPubSubMessage) {
            message = packet.data;
        }
        else {
            message = new gc_message_builder_1.GCPubSubMessageBuilder(packet.data).build();
        }
        return message;
    }
}
exports.GCPubSubMessageSerializer = GCPubSubMessageSerializer;
//# sourceMappingURL=gc-message.serializer.js.map