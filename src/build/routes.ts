/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AccessRequestController } from './../controllers/AccessRequestController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HelloWorldController } from './../controllers/helloworld';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PinAuditLogController } from './../controllers/PinAuditLogController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PINController } from './../controllers/pinController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PropertiesController } from './../controllers/PropertiesController';
import { expressAuthentication } from './../middleware/apiKeyAuth';
// @ts-ignore - no great way to install types from subpackage
const promiseAny = require('promise.any');
import type { RequestHandler, Router } from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "GenericTypeORMErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "requiredFieldErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "serverErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserRoles": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Standard"]},{"dataType":"enum","enums":["Admin"]},{"dataType":"enum","enums":["SuperAdmin"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "accessRequestResponseBody": {
        "dataType": "refObject",
        "properties": {
            "userGuid": {"dataType":"string","required":true},
            "identityType": {"dataType":"string","required":true},
            "requestedRole": {"ref":"UserRoles","required":true},
            "organization": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "userName": {"dataType":"string","required":true},
            "givenName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "requestReason": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HelloWorldResponse": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "expirationReason": {
        "dataType": "refEnum",
        "enums": ["OP","CC","OR","CO"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "pinAuditAction": {
        "dataType": "refEnum",
        "enums": ["D","C","R"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "auditLogInfo": {
        "dataType": "refObject",
        "properties": {
            "logId": {"dataType":"string","required":true},
            "pin": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expiredAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expirationReason": {"dataType":"union","subSchemas":[{"ref":"expirationReason"},{"dataType":"enum","enums":[null]}],"required":true},
            "sentToEmail": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "sentToPhone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "pinCreatedAt": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "alteredByUsername": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "livePinId": {"dataType":"string","required":true},
            "action": {"ref":"pinAuditAction","required":true},
            "logCreatedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "auditLogReturn": {
        "dataType": "refObject",
        "properties": {
            "logs": {"dataType":"array","array":{"dataType":"refObject","ref":"auditLogInfo"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "updatedPIN": {
        "dataType": "refObject",
        "properties": {
            "pin": {"dataType":"string","required":true},
            "pids": {"dataType":"string","required":true},
            "livePinId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvalidTokenErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UnauthorizedErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "pinRangeErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "aggregateValidationErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "faults": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EntityNotFoundErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "createPinRequestBody": {
        "dataType": "refObject",
        "properties": {
            "pinLength": {"dataType":"double"},
            "allowedChars": {"dataType":"string"},
            "numberOfOwners": {"dataType":"double","required":true},
            "phoneNumber": {"dataType":"string"},
            "email": {"dataType":"string"},
            "pids": {"dataType":"string","required":true},
            "givenName": {"dataType":"string"},
            "lastName_1": {"dataType":"string","required":true},
            "lastName_2": {"dataType":"string"},
            "incorporationNumber": {"dataType":"string"},
            "addressLine_1": {"dataType":"string","required":true},
            "addressLine_2": {"dataType":"string"},
            "city": {"dataType":"string"},
            "provinceAbbreviation": {"dataType":"string"},
            "country": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "requesterUsername": {"dataType":"string"},
            "propertyAddress": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "serviceBCCreateRequestBody": {
        "dataType": "refObject",
        "properties": {
            "livePinId": {"dataType":"string","required":true},
            "email": {"dataType":"string"},
            "phoneNumber": {"dataType":"string"},
            "propertyAddress": {"dataType":"string","required":true},
            "pinLength": {"dataType":"double"},
            "allowedChars": {"dataType":"string"},
            "requesterUsername": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PIN": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PINObject": {
        "dataType": "refObject",
        "properties": {
            "pins": {"dataType":"array","array":{"dataType":"refAlias","ref":"PIN"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivePin": {
        "dataType": "refObject",
        "properties": {
            "livePinId": {"dataType":"string","required":true},
            "pin": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "pids": {"dataType":"string","required":true},
            "titleNumber": {"dataType":"string","required":true},
            "landTitleDistrict": {"dataType":"string","required":true},
            "titleStatus": {"dataType":"string","required":true},
            "fromTitleNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "fromLandTitleDistrict": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "givenName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "lastName_1": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "lastName_2": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "incorporationNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "addressLine_1": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "addressLine_2": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "city": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "provinceAbbreviation": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "provinceLong": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "country": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "postalCode": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "expireRequestBody": {
        "dataType": "refObject",
        "properties": {
            "livePinId": {"dataType":"string","required":true},
            "expirationReason": {"ref":"expirationReason","required":true},
            "expiredByUsername": {"dataType":"string"},
            "propertyAddress": {"dataType":"string","required":true},
            "phoneNumber": {"dataType":"string"},
            "email": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "verifyPinErrorType": {
        "dataType": "refObject",
        "properties": {
            "errorType": {"dataType":"string"},
            "errorMessage": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "verifyPinResponse": {
        "dataType": "refObject",
        "properties": {
            "verified": {"dataType":"boolean","required":true},
            "reason": {"ref":"verifyPinErrorType"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "verifyPinRequestBody": {
        "dataType": "refObject",
        "properties": {
            "pin": {"dataType":"string","required":true},
            "pids": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GeocoderAddress": {
        "dataType": "refObject",
        "properties": {
            "score": {"dataType":"double","required":true},
            "fullAddress": {"dataType":"string","required":true},
            "siteID": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "getAddressResults": {
        "dataType": "refObject",
        "properties": {
            "results": {"dataType":"array","array":{"dataType":"refObject","ref":"GeocoderAddress"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "searchRangeErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "geocoderReferenceErrorType": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "propertyDetailsResponse": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"string"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "unauthorizedError": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "code": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "badRequestError": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "code": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "forbiddenError": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "code": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "notFoundError": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "code": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "pidNotFound": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "code": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.post('/user-requests',
            ...(fetchMiddlewares<RequestHandler>(AccessRequestController)),
            ...(fetchMiddlewares<RequestHandler>(AccessRequestController.prototype.createAccessRequest)),

            function AccessRequestController_createAccessRequest(request: any, response: any, next: any) {
            const args = {
                    typeORMErrorResponse: {"in":"res","name":"422","required":true,"ref":"GenericTypeORMErrorType"},
                    requiredFieldErrorResponse: {"in":"res","name":"422","required":true,"ref":"requiredFieldErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"accessRequestResponseBody"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AccessRequestController();


              const promise = controller.createAccessRequest.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, 201, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/helloworld',
            ...(fetchMiddlewares<RequestHandler>(HelloWorldController)),
            ...(fetchMiddlewares<RequestHandler>(HelloWorldController.prototype.getMessage)),

            function HelloWorldController_getMessage(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new HelloWorldController();


              const promise = controller.getMessage.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/audit-trails',
            ...(fetchMiddlewares<RequestHandler>(PinAuditLogController)),
            ...(fetchMiddlewares<RequestHandler>(PinAuditLogController.prototype.getAuditLogs)),

            function PinAuditLogController_getAuditLogs(request: any, response: any, next: any) {
            const args = {
                    typeORMErrorResponse: {"in":"res","name":"422","required":true,"ref":"GenericTypeORMErrorType"},
                    requiredFieldErrorResponse: {"in":"res","name":"422","required":true,"ref":"requiredFieldErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    livePinIds: {"in":"query","name":"livePinIds","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PinAuditLogController();


              const promise = controller.getAuditLogs.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/pins/vhers-create',
            authenticateMiddleware([{"vhers_api_key":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PINController)),
            ...(fetchMiddlewares<RequestHandler>(PINController.prototype.createPin)),

            function PINController_createPin(request: any, response: any, next: any) {
            const args = {
                    _invalidTokenErrorResponse: {"in":"res","name":"400","required":true,"ref":"InvalidTokenErrorResponse"},
                    _unauthorizedErrorResponse: {"in":"res","name":"401","required":true,"ref":"UnauthorizedErrorResponse"},
                    rangeErrorResponse: {"in":"res","name":"422","required":true,"ref":"pinRangeErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    aggregateErrorResponse: {"in":"res","name":"422","required":true,"ref":"aggregateValidationErrorType"},
                    notFoundErrorResponse: {"in":"res","name":"422","required":true,"ref":"EntityNotFoundErrorType"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"createPinRequestBody"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PINController();


              const promise = controller.createPin.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/pins/vhers-regenerate',
            authenticateMiddleware([{"vhers_api_key":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PINController)),
            ...(fetchMiddlewares<RequestHandler>(PINController.prototype.recreatePin)),

            function PINController_recreatePin(request: any, response: any, next: any) {
            const args = {
                    _invalidTokenErrorResponse: {"in":"res","name":"400","required":true,"ref":"InvalidTokenErrorResponse"},
                    _unauthorizedErrorResponse: {"in":"res","name":"401","required":true,"ref":"UnauthorizedErrorResponse"},
                    rangeErrorResponse: {"in":"res","name":"422","required":true,"ref":"pinRangeErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    aggregateErrorResponse: {"in":"res","name":"422","required":true,"ref":"aggregateValidationErrorType"},
                    notFoundErrorResponse: {"in":"res","name":"422","required":true,"ref":"EntityNotFoundErrorType"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"createPinRequestBody"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PINController();


              const promise = controller.recreatePin.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/pins/create',
            ...(fetchMiddlewares<RequestHandler>(PINController)),
            ...(fetchMiddlewares<RequestHandler>(PINController.prototype.serviceBCCreatePin)),

            function PINController_serviceBCCreatePin(request: any, response: any, next: any) {
            const args = {
                    rangeErrorResponse: {"in":"res","name":"422","required":true,"ref":"pinRangeErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    aggregateErrorResponse: {"in":"res","name":"422","required":true,"ref":"aggregateValidationErrorType"},
                    notFoundErrorResponse: {"in":"res","name":"422","required":true,"ref":"EntityNotFoundErrorType"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"serviceBCCreateRequestBody"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PINController();


              const promise = controller.serviceBCCreatePin.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/pins/regenerate',
            ...(fetchMiddlewares<RequestHandler>(PINController)),
            ...(fetchMiddlewares<RequestHandler>(PINController.prototype.serviceBCRecreatePin)),

            function PINController_serviceBCRecreatePin(request: any, response: any, next: any) {
            const args = {
                    rangeErrorResponse: {"in":"res","name":"422","required":true,"ref":"pinRangeErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    aggregateErrorResponse: {"in":"res","name":"422","required":true,"ref":"aggregateValidationErrorType"},
                    notFoundErrorResponse: {"in":"res","name":"422","required":true,"ref":"EntityNotFoundErrorType"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"serviceBCCreateRequestBody"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PINController();


              const promise = controller.serviceBCRecreatePin.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/pins/initial-create',
            ...(fetchMiddlewares<RequestHandler>(PINController)),
            ...(fetchMiddlewares<RequestHandler>(PINController.prototype.getInitialPins)),

            function PINController_getInitialPins(request: any, response: any, next: any) {
            const args = {
                    rangeErrorResponse: {"in":"res","name":"422","required":true,"ref":"pinRangeErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    quantity: {"in":"query","name":"quantity","required":true,"dataType":"double"},
                    pinLength: {"in":"query","name":"pinLength","dataType":"double"},
                    allowedChars: {"in":"query","name":"allowedChars","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PINController();


              const promise = controller.getInitialPins.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/pins/expire',
            ...(fetchMiddlewares<RequestHandler>(PINController)),
            ...(fetchMiddlewares<RequestHandler>(PINController.prototype.expirePin)),

            function PINController_expirePin(request: any, response: any, next: any) {
            const args = {
                    entityErrorResponse: {"in":"res","name":"422","required":true,"ref":"EntityNotFoundErrorType"},
                    typeORMErrorResponse: {"in":"res","name":"422","required":true,"ref":"GenericTypeORMErrorType"},
                    requiredFieldErrorResponse: {"in":"res","name":"422","required":true,"ref":"requiredFieldErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"expireRequestBody"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PINController();


              const promise = controller.expirePin.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/pins/verify',
            authenticateMiddleware([{"vhers_api_key":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PINController)),
            ...(fetchMiddlewares<RequestHandler>(PINController.prototype.verifyPin)),

            function PINController_verifyPin(request: any, response: any, next: any) {
            const args = {
                    _invalidTokenErrorResponse: {"in":"res","name":"400","required":true,"ref":"InvalidTokenErrorResponse"},
                    _unauthorizedErrorResponse: {"in":"res","name":"401","required":true,"ref":"UnauthorizedErrorResponse"},
                    verificationErrorResponse: {"in":"res","name":"403","required":true,"ref":"verifyPinResponse"},
                    notFoundErrorResponse: {"in":"res","name":"404","required":true,"ref":"verifyPinResponse"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"verifyPinResponse"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"verifyPinRequestBody"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PINController();


              const promise = controller.verifyPin.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/properties/address/:address',
            ...(fetchMiddlewares<RequestHandler>(PropertiesController)),
            ...(fetchMiddlewares<RequestHandler>(PropertiesController.prototype.getSiteID)),

            function PropertiesController_getSiteID(request: any, response: any, next: any) {
            const args = {
                    rangeErrorResponse: {"in":"res","name":"422","required":true,"ref":"searchRangeErrorType"},
                    referenceErrorResponse: {"in":"res","name":"422","required":true,"ref":"geocoderReferenceErrorType"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    address: {"in":"path","name":"address","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PropertiesController();


              const promise = controller.getSiteID.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/properties/details',
            ...(fetchMiddlewares<RequestHandler>(PropertiesController)),
            ...(fetchMiddlewares<RequestHandler>(PropertiesController.prototype.getPropertyDetails)),

            function PropertiesController_getPropertyDetails(request: any, response: any, next: any) {
            const args = {
                    unauthorizedErrorResponse: {"in":"res","name":"401","required":true,"ref":"unauthorizedError"},
                    badRequestErrorResponse: {"in":"res","name":"400","required":true,"ref":"badRequestError"},
                    forbiddenErrorResponse: {"in":"res","name":"403","required":true,"ref":"forbiddenError"},
                    notFoundErrorResponse: {"in":"res","name":"404","required":true,"ref":"notFoundError"},
                    serverErrorResponse: {"in":"res","name":"500","required":true,"ref":"serverErrorType"},
                    pidNotFoundResponse: {"in":"res","name":"204","required":true,"ref":"pidNotFound"},
                    siteID: {"in":"query","name":"siteID","required":true,"dataType":"string"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PropertiesController();


              const promise = controller.getPropertyDetails.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, _response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await promiseAny.call(Promise, secMethodOrPromises);
                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            response.status(statusCode || 200)
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'queries':
                    return validationService.ValidateParam(args[key], request.query, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
