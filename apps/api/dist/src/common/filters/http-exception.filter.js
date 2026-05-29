"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const r = exception.getResponse();
            message = (typeof r === 'string' ? r : r.message) ?? exception.message;
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            // Map common Prisma errors to clean HTTP responses
            const prismaErr = exception;
            switch (prismaErr.code) {
                case 'P2002':
                    status = common_1.HttpStatus.CONFLICT;
                    message = `Unique constraint failed on ${JSON.stringify(prismaErr.meta?.target)}`;
                    break;
                case 'P2025':
                    status = common_1.HttpStatus.NOT_FOUND;
                    message = 'Record not found';
                    break;
                case 'P2003':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = 'Foreign key constraint failed';
                    break;
                default:
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = prismaErr.message;
            }
            code = prismaErr.code;
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        this.logger.error(`${request.method} ${request.url} → ${status} ${typeof message === 'string' ? message : JSON.stringify(message)}`, exception instanceof Error ? exception.stack : undefined);
        response.status(status).json({
            ok: false,
            status,
            code,
            path: request.url,
            timestamp: new Date().toISOString(),
            message,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map