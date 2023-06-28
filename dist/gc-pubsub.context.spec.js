"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const gc_pubsub_context_1 = require("./gc-pubsub.context");
describe('GCPubSubContext', () => {
    const args = [{}, 'pattern'];
    let context;
    beforeEach(() => {
        context = new gc_pubsub_context_1.GCPubSubContext(args);
    });
    describe('getSubject', () => {
        it('should return subject', () => {
            (0, chai_1.expect)(context.getMessage()).to.be.eql(args[0]);
        });
    });
    describe('getPattern', () => {
        it('should return pattern', () => {
            (0, chai_1.expect)(context.getPattern()).to.be.eql(args[1]);
        });
    });
});
//# sourceMappingURL=gc-pubsub.context.spec.js.map