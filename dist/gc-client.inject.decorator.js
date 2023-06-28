"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectGCPubSubClient = exports.getGCPubSubClientToken = void 0;
const common_1 = require("@nestjs/common");
const gc_pubsub_constants_1 = require("./gc-pubsub.constants");
const getGCPubSubClientToken = (name) => gc_pubsub_constants_1.GC_PUBSUB_CLIENT_PREFIX + name;
exports.getGCPubSubClientToken = getGCPubSubClientToken;
const InjectGCPubSubClient = (name) => (0, common_1.Inject)((0, exports.getGCPubSubClientToken)(name));
exports.InjectGCPubSubClient = InjectGCPubSubClient;
//# sourceMappingURL=gc-client.inject.decorator.js.map