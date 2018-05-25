#!/usr/bin/env node
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var request = require('http').request;
var execSync = require('child_process').execSync;
var logger = require('../lib/logger');
var chalk = require('chalk');
var ora = require('ora');
var prompt = require('inquirer').createPromptModule();
var JENKINS_TOKEN = execSync('npm config get JENKINS_TOKEN').toString();
var BRANCH = execSync('git status | head -n 1  | awk \'{print  $3}\'').toString().trim();
var resultReg = /^{"result":"(\w+)"}$/;
var releaseObj = {
    job: 'InPromo_release',
    type: '',
    body: {
        'parameter': {
            'name': 'BRANCH',
            'value': BRANCH
        }
    }
};
var flowWebtestObj = {
    job: 'InPromo_deploy_flow',
    type: 'type:［webtest］',
    body: {
        'parameter': [
            {
                "name": "deploy_version",
                "runId": "InPromo_release#"
            }, {
                "name": "deploy_env",
                "value": "webtest"
            },
            {
                "name": "purpose",
                "value": ""
            }
        ]
    }
};
var flowOnlineObj = {
    job: 'InPromo_deploy_flow',
    type: 'type:［online］ ',
    body: {
        'parameter': [
            {
                "name": "deploy_version",
                "runId": "InPromo_release#"
            }, {
                "name": "deploy_env",
                "value": "online"
            },
            {
                "name": "purpose",
                "value": ""
            }
        ]
    }
};
var question = [
    {
        type: 'confirm',
        name: 'confirm',
        message: '确定要发布线上么',
        default: false
    }, {
        type: 'confirm',
        name: 'merge',
        message: '确定都合并到master了么',
        default: false
    }
];
/**
 * 延迟等待
 * @param time 毫秒数
 */
var sleep = function (time) { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, time); }); };
var jenkisPost = function (body, path) { return new Promise(function (resolve, reject) {
    var bodyString = "json=" + encodeURIComponent(JSON.stringify(body));
    var req = request({
        port: 8001,
        hostname: '10.10.106.240',
        method: 'POST',
        auth: JENKINS_TOKEN.trim(),
        headers: {
            'Content-Length': Buffer.byteLength(bodyString),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        path: path
    }, function (res) {
        var rawData = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) { return (rawData += chunk); });
        res.on('end', function (_res) {
            resolve(rawData);
        });
    });
    req.write(bodyString);
    req.end();
}); };
var jenkisFlow = function (jobObject) { return __awaiter(_this, void 0, void 0, function () {
    var job, type, body, nextBuildNumber, _a, _b, spinner, result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                job = jobObject.job, type = jobObject.type, body = jobObject.body;
                _b = (_a = /\d+/).exec;
                return [4 /*yield*/, jenkisPost({}, "/jenkins/view/InPromo/job/" + job + "/api/json?tree=nextBuildNumber")];
            case 1:
                nextBuildNumber = _b.apply(_a, [_c.sent()])[0];
                console.log(job + " -> \u5F00\u59CB\u6784\u5EFA " + chalk.blue(type + 'number: ［' + nextBuildNumber + ']') + "  " + chalk.blue('branch:［' + BRANCH + ']'));
                spinner = ora('构建中...').start();
                return [4 /*yield*/, jenkisPost(body, "/jenkins/view/InPromo/job/" + job + "/build")];
            case 2:
                _c.sent();
                result = '';
                _c.label = 3;
            case 3:
                if (!!resultReg.exec(result)) return [3 /*break*/, 6];
                return [4 /*yield*/, jenkisPost({}, ("/jenkins/view/InPromo/job/" + job + "/$numb$/api/json?tree=result").replace('$numb$', nextBuildNumber))];
            case 4:
                result = _c.sent();
                return [4 /*yield*/, sleep(2000)];
            case 5:
                _c.sent();
                return [3 /*break*/, 3];
            case 6:
                spinner.stop();
                if (!/SUCCESS/.exec(result)) {
                    spinner.fail(job + " -> \u6784\u5EFA\u5B8C\u6210  " + chalk.blue(type + " number: [" + nextBuildNumber + "] \u53D1\u5E03\u5931\u8D25"));
                    throw new Error(type + " number: [" + nextBuildNumber + "] \u53D1\u5E03\u5931\u8D25");
                    return [2 /*return*/, false];
                }
                else {
                    spinner.succeed(job + " -> \u6784\u5EFA\u5B8C\u6210  " + chalk.blue(type + "  number: [" + nextBuildNumber + "] \u53D1\u5E03\u6210\u529F"));
                }
                spinner.stop();
                return [2 /*return*/, nextBuildNumber];
        }
    });
}); };
var jenkinsPromise = function () { return __awaiter(_this, void 0, void 0, function () {
    var number, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, jenkisFlow(releaseObj)
                    // 构建InPromo_deploy_flow  #webtest
                ];
            case 1:
                number = _a.sent();
                // 构建InPromo_deploy_flow  #webtest
                flowWebtestObj.body.parameter[0].runId += number;
                return [4 /*yield*/, jenkisFlow(flowWebtestObj)
                    // 构建InPromo_deploy_flow  #online
                ];
            case 2:
                _a.sent();
                // 构建InPromo_deploy_flow  #online
                flowOnlineObj.body.parameter[0].runId += number;
                return [4 /*yield*/, jenkisFlow(flowOnlineObj)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.log(chalk.red(e_1));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
var jenkinsPrepare = function () { return __awaiter(_this, void 0, void 0, function () {
    var spinner, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                spinner = ora('开始检查配置').start();
                if (JENKINS_TOKEN === 'undefined') {
                    return [2 /*return*/, spinner.fail(chalk.red("\u914D\u7F6E\u7F3A\u5C11 JENKINS_TOKE"))];
                }
                spinner.stop();
                return [4 /*yield*/, prompt(question)];
            case 1:
                answer = _a.sent();
                if (!(answer.confirm && answer.merge))
                    return [2 /*return*/, spinner.warn('部署取消')];
                return [4 /*yield*/, jenkinsPromise()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
if (!(~['master'].indexOf(BRANCH))) {
    logger.fatal("\u5F53\u524D\u5206\u652F\uFF1A " + BRANCH + " \u4E0D\u80FD\u53D1\u5E03\u5176\u4ED6\u5206\u652F \u53EA\u53D1\u5E03\u7EBF\u4E0A\u5206\u652F ");
}
jenkinsPrepare();
