"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const gc_message_builder_1 = require("./gc-message.builder");
const gc_message_serializer_1 = require("./gc-message.serializer");
const sinon = require("sinon");
describe('GCPubSubMessageSerializer', () => {
    let serializer = new gc_message_serializer_1.GCPubSubMessageSerializer();
    let sandbox = sinon.createSandbox();
    let buildStub;
    beforeEach(() => {
        buildStub = sandbox.stub(gc_message_builder_1.GCPubSubMessageBuilder.prototype, 'build');
    });
    afterEach(() => {
        sandbox.restore();
        buildStub.reset();
    });
    it('should return a GCPubSubMessage instance', () => {
        buildStub.returns(new gc_message_builder_1.GCPubSubMessage({ key: 'value' }, { attr: 'value' }, undefined));
        const data = { key: 'value' };
        const attributes = { attr: 'value' };
        const msg = new gc_message_builder_1.GCPubSubMessageBuilder(data)
            .setAttributes(attributes)
            .build();
        const packet = { data: msg, pattern: 'test' };
        const message = new gc_message_builder_1.GCPubSubMessage(data, attributes, undefined);
        const result = serializer.serialize(packet);
        (0, chai_1.expect)(result).to.deep.equal(message);
    });
    it('should create a new GCPubSubMessage using GCPubSubMessageBuilder if packet data is not a GCPubSubMessage', () => {
        const data = 'data';
        buildStub.returns(new gc_message_builder_1.GCPubSubMessage(data, undefined, undefined));
        const packet = { data: data, pattern: 'test' };
        const result = serializer.serialize(packet);
        (0, chai_1.expect)(result).to.be.an.instanceOf(gc_message_builder_1.GCPubSubMessage);
        (0, chai_1.expect)(buildStub.calledOnce).to.be.true;
    });
});
//# sourceMappingURL=gc-message.serializer.spec.js.map