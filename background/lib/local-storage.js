var Jsonfile = require('jsonfile')
var Defer = require("node-promise").defer
var App = require('app')

var CLIENTS_JSON_FILE_PATH = App.getPath('userCache') + '/' + 'clients.json';
var SETTING_JSON_FILE_PATH = App.getPath('userCache') + '/' + 'setting.json';

var LocalStorage = function() {
  function saveDefaultPath() {

  }

  function saveSettings() {

  }

  function saveClients(clients) {
    var deferred = Defer();
    Jsonfile.writeFile(CLIENTS_JSON_FILE_PATH, clients, function(err) {
      deferred.resolve();
    });
    return deferred.promise;
  }

  function getClients() {
    var deferred = Defer();
    Jsonfile.readFile(CLIENTS_JSON_FILE_PATH, function (err, clients) {
      if (!err && clients) {
        deferred.resolve(clients);
      }
    });
    return deferred.promise;
  }

  return {
    saveClients: saveClients,
    getClients: getClients
  }
}

module.exports = new LocalStorage;
