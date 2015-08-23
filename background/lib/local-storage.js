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
    Jsonfile.writeFileSync(CLIENTS_JSON_FILE_PATH, clients);
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
