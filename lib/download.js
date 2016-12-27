'use strict'

var gitclone = require('git-clone');
var rm = require('rimraf').sync;

/**
 * Expose `download`.
 */

module.exports = download;

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Function} fn
 */

function download(repo, dest, fn) {
  repo = normalize(repo);
  var url = getUrl(repo);

  gitclone(url, dest, { checkout: repo.checkout }, function(err) {
    if (err === undefined) {
      rm(dest + "/.git");
      fn();
    }
    else {
      fn(err);
    }
  });
}

/**
 * Normalize a repo string.
 *
 * @param {String} string
 * @return {Object}
 */

function normalize(repo) {
  var regex = /^((github|gitlab|bitbucket):)?((.+):)?([^/]+)\/([^#]+)(#(.+))?$/;
  var match = regex.exec(repo);
  var host = match[4] || null;
  var owner = match[5];
  var name = match[6];
  var checkout = match[8] || 'master';

  return {
    host: 'githost.in66.cc',
    owner: owner,
    name: name,
    checkout: checkout
  };
}
/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */

function getUrl(repo) {
  return "git@" + repo.host + ":" + repo.owner + "/" + repo.name + ".git";
}