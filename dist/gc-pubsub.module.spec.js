"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gc_pubsub_module_1 = require("./gc-pubsub.module");
const chai_1 = require("chai");
const gc_pubsub_client_1 = require("./gc-pubsub.client");
const gc_client_inject_decorator_1 = require("./gc-client.inject.decorator");
const removeClientId = (data) => {
    delete data.clientId;
    return data;
};
describe('GCPubSubModule', () => {
    let dynamicModule;
    describe('register', () => {
        const moduleConfigs = [
            {
                name: 'name1',
                config: {},
            },
            {
                name: 'name2',
                config: {},
            },
        ];
        beforeEach(() => {
            dynamicModule = gc_pubsub_module_1.GCPubSubClientModule.register(moduleConfigs);
        });
        it('should return an expected module ref', () => {
            (0, chai_1.expect)(dynamicModule.module).to.be.equal(gc_pubsub_module_1.GCPubSubClientModule);
        });
        it('should return a provider array', () => dynamicModule.providers.forEach((provider, index) => {
            (0, chai_1.expect)(provider.provide).to.equal((0, gc_client_inject_decorator_1.getGCPubSubClientToken)(moduleConfigs[index].name));
            (0, chai_1.expect)(provider.useValue).to.be.instanceOf(gc_pubsub_client_1.GCPubSubClient);
            (0, chai_1.expect)(removeClientId(provider.useValue)).to.deep.equal(gc_pubsub_module_1.GCPubSubClientModule['assignOnAppShutdownHook'](removeClientId(new gc_pubsub_client_1.GCPubSubClient({}))));
        }));
    });
    describe('registerAsync', () => {
        const useFactory = () => {
            return {};
        };
        const registerOption = {
            name: 'test',
            useFactory,
        };
        it('should return an expected module ref', () => {
            dynamicModule = gc_pubsub_module_1.GCPubSubClientModule.registerAsync([registerOption]);
            (0, chai_1.expect)(dynamicModule.module).to.be.eql(gc_pubsub_module_1.GCPubSubClientModule);
        });
        describe('when useFactory', () => {
            it('should return an expected providers array with useFactory', () => {
                dynamicModule = gc_pubsub_module_1.GCPubSubClientModule.registerAsync([registerOption]);
                (0, chai_1.expect)(dynamicModule.imports).to.be.deep.eq([]);
                (0, chai_1.expect)(dynamicModule.exports).to.be.eq(dynamicModule.providers);
                (0, chai_1.expect)(dynamicModule.providers).to.be.have.length(1);
                const provider = dynamicModule.providers[0];
                (0, chai_1.expect)(provider.provide).to.be.eql((0, gc_client_inject_decorator_1.getGCPubSubClientToken)('test'));
                (0, chai_1.expect)(provider.inject).to.be.deep.eq([]);
                (0, chai_1.expect)(provider.useFactory).to.be.an.instanceOf(Function);
            });
        });
    });
});
//# sourceMappingURL=gc-pubsub.module.spec.js.map