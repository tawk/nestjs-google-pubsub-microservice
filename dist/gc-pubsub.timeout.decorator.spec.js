"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gc_pubsub_timeout_decorator_1 = require("./gc-pubsub.timeout.decorator");
const testing_1 = require("@nestjs/testing");
const gc_pubsub_timeout_controller_1 = require("./gc-pubsub.timeout.controller");
const request = require("supertest");
const sinon = require("sinon");
describe('TimeoutInterceptor', () => {
    let server;
    let app;
    const clock = sinon.useFakeTimers();
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [gc_pubsub_timeout_controller_1.GCPubSubTimeoutController],
            providers: [gc_pubsub_timeout_decorator_1.TimeoutInterceptor],
        }).compile();
        app = module.createNestApplication();
        server = app.getHttpAdapter().getInstance();
        await app.init();
    });
    afterEach(async () => {
        clock.restore();
        await app.close();
    });
    afterAll(() => {
        clock.restore();
    });
    it('should return 200 when the endpoint finish executing before timeout', () => {
        const req = request(server).get('/');
        clock.tick(200);
        req.expect(200);
    });
    it('should throw RequestTimeoutError when the request exceeds timeout', () => {
        const req = request(server).get('/fail');
        clock.tick(1000);
        req.expect(408);
    });
});
//# sourceMappingURL=gc-pubsub.timeout.decorator.spec.js.map