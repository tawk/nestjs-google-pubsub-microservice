"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const gc_message_builder_1 = require("./gc-message.builder");
describe('GCPubSubMessageBuilder', () => {
    let builder;
    const data = { id: 1, name: 'John Doe' };
    const attributes = { category: 'person' };
    const orderingKey = '1';
    beforeEach(() => {
        builder = new gc_message_builder_1.GCPubSubMessageBuilder(data, attributes, orderingKey, 50);
    });
    describe('setAttributes', () => {
        it('should set the attributes correctly', () => {
            const attributes = { category: 'animals' };
            const result = builder.setAttributes(attributes).build();
            (0, chai_1.expect)(result.attributes).to.deep.equal(attributes);
        });
    });
    describe('setData', () => {
        it('should set the data correctly', () => {
            const tempData = { id: 2, name: 'Paul' };
            const result = builder.setData(tempData).build();
            (0, chai_1.expect)(result.json).to.equal(tempData);
        });
    });
    describe('setOrderingKey', () => {
        it('should set the ordering key correctly', () => {
            const orderingKey = '1';
            const result = builder.setOrderingKey(orderingKey).build();
            (0, chai_1.expect)(result.orderingKey).to.equal(orderingKey);
        });
    });
    describe('setTimeout', () => {
        it('should add timeout attribute to attributes if timeout is set', () => {
            const builder = new gc_message_builder_1.GCPubSubMessageBuilder(data, attributes, orderingKey);
            builder.setTimeout(500);
            const message = builder.build();
            (0, chai_1.expect)(message.attributes._timeout).to.equal('500');
        });
        it('should assign timeout attribute to attributes if timeout is set and attributes are empty', () => {
            const builder = new gc_message_builder_1.GCPubSubMessageBuilder(data);
            builder.setTimeout(500);
            const message = builder.build();
            (0, chai_1.expect)(message.attributes._timeout).to.equal('500');
        });
        it('should throw an error if timeout is negative', () => {
            const builder = new gc_message_builder_1.GCPubSubMessageBuilder(data);
            builder.setTimeout(-1);
            (0, chai_1.expect)(() => builder.build()).to.throw('Invalid Timeout Value');
        });
    });
    it('should create a new GCPubSubMessage with the correct parameters with timeout', () => {
        const builder = new gc_message_builder_1.GCPubSubMessageBuilder(data, attributes, orderingKey).setTimeout(500);
        const message = builder.build();
        (0, chai_1.expect)(message.json).to.deep.equal(data);
        (0, chai_1.expect)(message.attributes).to.deep.equal(Object.assign(attributes, { timeout: 500 }));
        (0, chai_1.expect)(message.orderingKey).to.equal(orderingKey);
        (0, chai_1.expect)(message.attributes._timeout).to.equal('500');
    });
    describe('#build', () => {
        it('should build with valid data only', () => {
            const message = new gc_message_builder_1.GCPubSubMessageBuilder('data').build();
            (0, chai_1.expect)(message).to.be.instanceOf(gc_message_builder_1.GCPubSubMessage);
            (0, chai_1.expect)(message.json).to.equal('data');
            (0, chai_1.expect)(message.attributes).to.be.an('object').and.is.empty;
            (0, chai_1.expect)(message.orderingKey).to.be.undefined;
        });
        it('should throw an error if data is missing', () => {
            const builder = new gc_message_builder_1.GCPubSubMessageBuilder();
            builder.setAttributes(attributes).setOrderingKey(orderingKey);
            (0, chai_1.expect)(() => builder.build()).to.throw('Missing Data');
        });
        it('should create a new GCPubSubMessage with the correct parameters', () => {
            const builder = new gc_message_builder_1.GCPubSubMessageBuilder(data, attributes, orderingKey);
            const message = builder.build();
            (0, chai_1.expect)(message.json).to.deep.equal(data);
            (0, chai_1.expect)(message.attributes).to.deep.equal(attributes);
            (0, chai_1.expect)(message.orderingKey).to.equal(orderingKey);
        });
        it('should create a new GCPubSubMessage with the correct parameters with timeout', () => {
            const builder = new gc_message_builder_1.GCPubSubMessageBuilder(data, attributes, orderingKey).setTimeout(500);
            const message = builder.build();
            (0, chai_1.expect)(message.json).to.deep.equal(data);
            (0, chai_1.expect)(message.attributes).to.deep.equal(Object.assign(attributes, { timeout: 500 }));
            (0, chai_1.expect)(message.orderingKey).to.equal(orderingKey);
            (0, chai_1.expect)(message.attributes._timeout).to.equal('500');
        });
    });
});
//# sourceMappingURL=gc-message.builder.spec.js.map