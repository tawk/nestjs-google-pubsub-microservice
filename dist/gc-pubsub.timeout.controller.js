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
exports.GCPubSubTimeoutController = void 0;
const common_1 = require("@nestjs/common");
const gc_pubsub_timeout_decorator_1 = require("./gc-pubsub.timeout.decorator");
let GCPubSubTimeoutController = class GCPubSubTimeoutController {
    async sucess() {
        await this.wait(300);
        return true;
    }
    async fail() {
        await this.wait(5000);
        return true;
    }
    wait(time) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }
};
__decorate([
    (0, gc_pubsub_timeout_decorator_1.GCPubSubClientTimeoutInterceptor)(400),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GCPubSubTimeoutController.prototype, "sucess", null);
__decorate([
    (0, gc_pubsub_timeout_decorator_1.GCPubSubClientTimeoutInterceptor)(800),
    (0, common_1.Get)('/fail'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GCPubSubTimeoutController.prototype, "fail", null);
GCPubSubTimeoutController = __decorate([
    (0, common_1.Controller)()
], GCPubSubTimeoutController);
exports.GCPubSubTimeoutController = GCPubSubTimeoutController;
//# sourceMappingURL=gc-pubsub.timeout.controller.js.map