"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GCPubSubClientModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPubSubClientModule = void 0;
const common_1 = require("@nestjs/common");
const gc_pubsub_timeout_decorator_1 = require("./gc-pubsub.timeout.decorator");
const gc_pubsub_client_1 = require("./gc-pubsub.client");
const gc_client_inject_decorator_1 = require("./gc-client.inject.decorator");
let GCPubSubClientModule = GCPubSubClientModule_1 = class GCPubSubClientModule {
    static register(options) {
        const clients = options.map((option) => {
            return {
                provide: (0, gc_client_inject_decorator_1.getGCPubSubClientToken)(option.name),
                useValue: this.assignOnAppShutdownHook(new gc_pubsub_client_1.GCPubSubClient(option.config)),
            };
        });
        return {
            module: GCPubSubClientModule_1,
            providers: clients,
            exports: clients,
        };
    }
    static registerAsync(options) {
        const providers = options.reduce((accProvider, item) => accProvider
            .concat([this.createAsyncProviders(item)])
            .concat(item.extraProviders || []), []);
        const imports = options.reduce((accImports, option) => option.imports && !accImports.includes(option.imports)
            ? accImports.concat(option.imports)
            : accImports, []);
        return {
            module: GCPubSubClientModule_1,
            providers: providers,
            exports: providers,
            imports: imports,
        };
    }
    static createAsyncProviders(options) {
        return {
            provide: (0, gc_client_inject_decorator_1.getGCPubSubClientToken)(options.name),
            useFactory: this.createFactoryWrapper(options.useFactory),
            inject: options.inject || [],
        };
    }
    static createFactoryWrapper(useFactory) {
        return async (...args) => {
            const clientOptions = await useFactory(...args);
            const clientProxyRef = new gc_pubsub_client_1.GCPubSubClient(clientOptions);
            return this.assignOnAppShutdownHook(clientProxyRef);
        };
    }
    static assignOnAppShutdownHook(client) {
        client.onApplicationShutdown =
            client.close;
        return client;
    }
};
GCPubSubClientModule = GCPubSubClientModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [gc_pubsub_timeout_decorator_1.TimeoutInterceptor],
        exports: [gc_pubsub_timeout_decorator_1.TimeoutInterceptor],
    })
], GCPubSubClientModule);
exports.GCPubSubClientModule = GCPubSubClientModule;
//# sourceMappingURL=gc-pubsub.module.js.map