#!/usr/bin/env node


'use strict'
const request = require('http').request
const execSync = require('child_process').execSync
const logger = require('../lib/logger')
const chalk = require('chalk')
const ora = require('ora');
var prompt = require('inquirer').createPromptModule();

const JENKINS_TOKEN = execSync('npm config get JENKINS_TOKEN').toString()
const BRANCH = execSync('git status | head -n 1  | awk \'{print  $3}\'').toString().trim()
const resultReg = /^{"result":"(\w+)"}$/

const releaseObj = {
  job: 'InPromo_release',
  type: '',
  body: {
    'parameter': {
      'name': 'BRANCH',
      'value': BRANCH
    }
  }
}

const flowWebtestObj = {
  job: 'InPromo_deploy_flow',
  type: 'type:［webtest］',
  body: {
    'parameter': [
      {
        "name": "deploy_version",
        "runId": `InPromo_release#`
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
}

const flowOnlineObj = {
  job: 'InPromo_deploy_flow',
  type: 'type:［online］ ',
  body: {
    'parameter': [
      {
        "name": "deploy_version",
        "runId": `InPromo_release#`
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
}

const question = [
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
  }]


/**
 * 延迟等待
 * @param time 毫秒数
 */
const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time))


let jenkisPost = (body, path) => new Promise((resolve, reject) => {
  var bodyString = `json=${encodeURIComponent(JSON.stringify(body))}`
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
  }, res => {
    let rawData = ''
    res.setEncoding('utf8')
    res.on('data', chunk => (rawData += chunk))
    res.on('end', (_res) => {
      resolve(rawData)
    })
  })
  req.write(bodyString)
  req.end()
})

var jenkisFlow = async (jobObject) => {
  const { job, type, body } = jobObject
  let nextBuildNumber = /\d+/.exec(await jenkisPost({}, `/jenkins/view/InPromo/job/${job}/api/json?tree=nextBuildNumber`))[0]
  console.log(`${job} -> 开始构建 ${chalk.blue(type + 'number: ［' + nextBuildNumber + ']')}  ${chalk.blue('branch:［' + BRANCH + ']')}`)
  const spinner = ora('构建中...').start();
  await jenkisPost(body, `/jenkins/view/InPromo/job/${job}/build`)
  let result = ''
  while (!resultReg.exec(result)) {
    result = await jenkisPost({}, `/jenkins/view/InPromo/job/${job}/$numb$/api/json?tree=result`.replace('$numb$', nextBuildNumber))
    await sleep(2000)
  }
  spinner.stop()
  if (!/SUCCESS/.exec(result)) {
    spinner.fail(`${job} -> 构建完成  ${chalk.blue(`${type} number: [${nextBuildNumber}] 发布失败`)}`)
    throw new Error(`${type} number: [${nextBuildNumber}] 发布失败`)
    return false
  } else {
    spinner.succeed(`${job} -> 构建完成  ${chalk.blue(`${type}  number: [${nextBuildNumber}] 发布成功`)}`)
  }
  spinner.stop()
  return nextBuildNumber
}


var jenkinsPromise = async () => {
  try {
    // 构建InPromo_release
    const number = await jenkisFlow(releaseObj)
    // 构建InPromo_deploy_flow  #webtest
    flowWebtestObj.body.parameter[0].runId += number
    await jenkisFlow(flowWebtestObj)
    // 构建InPromo_deploy_flow  #online
    flowOnlineObj.body.parameter[0].runId += number
    await jenkisFlow(flowOnlineObj)
  } catch (e) {
    console.log(chalk.red(e))
  }
}

var jenkinsPrepare = async () => {
  let spinner = ora('开始检查配置').start()
  if (JENKINS_TOKEN === 'undefined') {
    return spinner.fail(chalk.red(`配置缺少 JENKINS_TOKE`))
  }
  spinner.stop()
  const answer = await prompt(question)
  if (!(answer.confirm && answer.merge)) return spinner.warn('部署取消')
  await jenkinsPromise()
}

if (!(~['master'].indexOf(BRANCH))) {
  logger.fatal(`当前分支： ${BRANCH} 不能发布其他分支 只发布线上分支 `)
}


jenkinsPrepare()