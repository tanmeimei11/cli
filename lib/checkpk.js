const fs = require('fs')
const logger = require('../lib/logger')

if (!fs.existsSync('package.json')) {
	logger.fatal('缺失项目配置文件 package.json')
}

module.exports = JSON.parse(fs.readFileSync('package.json'))