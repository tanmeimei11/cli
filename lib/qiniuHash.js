const createHash = require('crypto').createHash
const readFileSync = require('fs').readFileSync
/**
 * 采用七牛的hash算法
 * https://github.com/qiniu/qetag/blob/master/qetag.js
 * @param {File} file 选择的文件
 * @return {String} hash值
 */
module.exports = function getEtag(file) {
    // 以4M为单位分割
    var blockSize = 4 * 1024 * 1024
    var sha1String = []
    var prefix = 0x16
    var blockCount = 0

    // sha1算法
    var sha1 = function (content) {
        var sha1 = createHash('sha1')
        sha1.update(content)
        return sha1.digest()
    }

    function calcEtag() {
        if (!sha1String.length) {
            return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ'
        }
        var sha1Buffer = Buffer.concat(sha1String, blockCount * 20)

        // 如果大于4M，则对各个块的sha1结果再次sha1
        if (blockCount > 1) {
            prefix = 0x96
            sha1Buffer = sha1(sha1Buffer)
        }

        sha1Buffer = Buffer.concat(
            [new Buffer([prefix]), sha1Buffer],
            sha1Buffer.length + 1
        )

        return sha1Buffer.toString('base64')
            .replace(/\//g, '_').replace(/\+/g, '-')
    }

    let buffer = readFileSync(file)
    var bufferSize = buffer.length
    blockCount = Math.ceil(bufferSize / blockSize)

    for (var i = 0; i < blockCount; i++) {
        sha1String.push(sha1(buffer.slice(i * blockSize, (i + 1) * blockSize)))
    }

    return calcEtag()
}