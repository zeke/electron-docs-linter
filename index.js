const seeds = require('./lib/seeds.json')
const API = require('./lib/api')
const fetchDocs = require('electron-docs')
const promisify = require('pify')
const semver = require('semver')
const exists = require('path-exists').sync
const keyedArray = require('keyed-array')

function lint (path, targetVersion, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Expected a callback function as third argument')
  }

  if (!semver.valid(targetVersion)) {
    throw new TypeError(`\`targetVersion\` must be a valid version number. Got: ${targetVersion}`)
  }

  if (!exists(path)) {
    throw new TypeError(`\`path\` must be an existing path on the filesystem. Got: ${path}`)
  }

  return fetchDocs(path)
    .then(function (docs) {
      var apis = seeds.map(props => {
        props.version = targetVersion
        return new API(props, docs)
      })

      // Attach named keys to collection arrays for easier access
      // apis.app.events.login
      // apis.app.methods.quit
      // apis.BrowserWindow.instanceMethods.isFocused
      apis = keyedArray(apis)

      return callback(null, apis)
    })
    .catch(function (err) {
      return callback(err)
    })
}

module.exports = promisify(lint)
