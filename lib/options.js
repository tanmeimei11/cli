'use strict'

const path = require('path')
const exists = require('fs').existsSync
const read = require('read-metadata').sync
const getGitUser = require('./git-user')
const validateName = require('validate-npm-package-name')


/**
 * Gets the metadata from either a meta.json or meta.js file.
 *
 * @param  {String} dir
 * @return {Object}
 */

function getMetadata (dir) {
  let js = path.join(dir, 'meta.js')
  let json = path.join(dir, 'meta.json')
  let opts = {}

  if (exists(json)) {
    opts = read(json)
  } else if (exists(js)) {
    let req = require(path.resolve(js))

    if (req !== Object(req)) {
      throw new Error('meta.js needs to expose an object')
    }

    opts = req
  }

  return opts
}

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */

function setDefault (opts, key, val) {
  var prompts = opts.prompts || (opts.prompts = {})

  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': val
    }
  } else {
    prompts[key]['default'] = val
  }
}

function setValidateName (opts) {
  opts.prompts.name.validate = function (name) {
    let its = validateName(name)

    if (!its.validForNewPackages) {
      let errors = (its.errors || []).concat(its.warnings || [])
      return 'Sorry, ' + errors.join(' and ') + '.'
    }
    return true
  }
}

/**
 * Read prompts metadata.
 *
 * @param {String} dir
 * @return {Object}
 */

module.exports = function options (name, dir) {
  let opts = getMetadata(dir)

  setDefault(opts, 'name', name)
  setValidateName(opts)

  let author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}