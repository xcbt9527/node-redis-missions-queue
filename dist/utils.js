"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.getRedisValueWithLock = exports.setRedisValueWithLock = exports.setBeginTime = exports.setCurIndex = exports.getCurIndex = exports.popTask = exports.delRedisKey = exports.setRedisValue = exports.getRedisValue = exports.pm2tips = exports.TASK_AMOUNT = exports.TASK_NAME = void 0;
const mqClient_1 = require("./mqClient");
exports.TASK_NAME = 'local_tasks';
exports.TASK_AMOUNT = 20;
exports.pm2tips = `<pm2 id: ${process.env.NODE_APP_INSTANCE}>`;
const getRedisValue = (key) => new Promise(resolve => mqClient_1.default.get(key, (err, reply) => resolve(reply)));
exports.getRedisValue = getRedisValue;
const setRedisValue = (key, value) => new Promise(resolve => mqClient_1.default.set(key, value, resolve));
exports.setRedisValue = setRedisValue;
const delRedisKey = (key) => new Promise(resolve => mqClient_1.default.del(key, resolve));
exports.delRedisKey = delRedisKey;
const popTask = () => new Promise(resolve => mqClient_1.default.blpop(exports.TASK_NAME, 1000, (err, reply) => resolve(reply[1])));
exports.popTask = popTask;
const getCurIndex = () => new Promise(resolve => mqClient_1.default.get(`${exports.TASK_NAME}_CUR_INDEX`, (err, reply) => resolve(Number(reply))));
exports.getCurIndex = getCurIndex;
const setCurIndex = (index) => new Promise(resolve => mqClient_1.default.set(`${exports.TASK_NAME}_CUR_INDEX`, String(index), resolve));
exports.setCurIndex = setCurIndex;
const setBeginTime = async (redlock) => {
    const lock = await redlock.lock(`locks:${exports.TASK_NAME}_SET_FIRST`, 1000);
    const setFirst = await (0, exports.getRedisValue)(`${exports.TASK_NAME}_SET_FIRST`);
    if (setFirst !== 'true') {
        console.log(`${exports.pm2tips} Get the first task!`);
        await (0, exports.setRedisValue)(`${exports.TASK_NAME}_SET_FIRST`, 'true');
        await (0, exports.setRedisValue)(`${exports.TASK_NAME}_BEGIN_TIME`, `${new Date().getTime()}`);
    }
    await lock.unlock().catch(e => e);
};
exports.setBeginTime = setBeginTime;
const setRedisValueWithLock = async (key, value, redlock, ttl = 1000) => {
    const lock = await redlock.lock(`locks:${key}`, ttl);
    await (0, exports.setRedisValue)(key, value);
    await lock.unlock().catch(e => e);
    return;
};
exports.setRedisValueWithLock = setRedisValueWithLock;
const getRedisValueWithLock = async (key, redlock, ttl = 1000) => {
    const lock = await redlock.lock(`locks:${key}`, ttl);
    const value = await (0, exports.getRedisValue)(key);
    await lock.unlock().catch(e => e);
    return value;
};
exports.getRedisValueWithLock = getRedisValueWithLock;
const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
exports.sleep = sleep;
//# sourceMappingURL=utils.js.map