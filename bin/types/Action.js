"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
class Action {
    constructor(message, token, callback) {
        this.message = message;
        this.token = token;
        this.callback = callback;
    }
}
exports.Action = Action;
