"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPubSubClientTimeoutInterceptor = exports.TimeoutInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let TimeoutInterceptor = class TimeoutInterceptor {
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const time = this.reflector.get('GCPubSubTimeoutTime', context.getHandler());
        if (!time || time < 0)
            throw new Error('Invalid Time');
        return next.handle().pipe((0, operators_1.timeout)(time), (0, operators_1.catchError)((err) => {
            if (err instanceof rxjs_1.TimeoutError) {
                return (0, rxjs_1.throwError)(() => new common_1.RequestTimeoutException());
            }
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
TimeoutInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TimeoutInterceptor);
exports.TimeoutInterceptor = TimeoutInterceptor;
function GCPubSubClientTimeoutInterceptor(ms) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)('GCPubSubTimeoutTime', ms), (0, common_1.UseInterceptors)(TimeoutInterceptor));
}
exports.GCPubSubClientTimeoutInterceptor = GCPubSubClientTimeoutInterceptor;
//# sourceMappingURL=gc-pubsub.timeout.decorator.js.map