"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPubSubContext = void 0;
const base_rpc_context_1 = require("@nestjs/microservices/ctx-host/base-rpc.context");
class GCPubSubContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    getMessage() {
        return this.args[0];
    }
    getPattern() {
        return this.args[1];
    }
}
exports.GCPubSubContext = GCPubSubContext;
//# sourceMappingURL=gc-pubsub.context.js.map