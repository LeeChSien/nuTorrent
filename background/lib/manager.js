var Md5      = require('md5')
var Jsonfile = require('jsonfile')

var App     = require('app')
var Ipc     = require('ipc')
var Dialog  = require('dialog')

var Client  = require('./client')

var ENTRIES_JSON_FILE_PATH = App.getPath('userCache') + '/' + 'entries.json';

var clients = [];
var clientEntries = [];

var window = null;

function Manager() {

  function removeItemByControlHash(array, controlHash){
    for(var i in array){
      if(array[i].controlHash == controlHash){
        array.splice(i,1);
        break;
      }
    }
  }

  function getItemBy(array, key, value){
    for(var i in array){
      if(array[i][key] == value){
        return array[i];
      }
    }
    return null;
  }

  //

  function addClient(entry, setting) {
    var client = new Client(entry, setting),
        ipcEventName = 'client-refresh-' + entry.controlHash;

    client.setIpcRefreshCallback(function(clientInfo) {
      if (window && window.webContents) { window.webContents.send(ipcEventName, clientInfo); }
    });

    clients.push(client);
  }

  function removeClient(controlHash) {
    removeItemByControlHash(clients, controlHash);
  }

  function getClients() {
    return clients;
  }

  function getClient(index) {
    return clients[index];
  }

  //

  function addClientEntry(entry) {
    clientEntries.push(entry);
    save();
  }

  function removeClientEntry(controlHash) {
    removeItemByControlHash(clientEntries, controlHash);
    save();
  }

  function getClientEntries() {
    return clientEntries;
  }

  //

  function restore() {
    Jsonfile.readFile(ENTRIES_JSON_FILE_PATH, function (err, _clientEntries) {
      if (!err && _clientEntries) {
        clientEntries = _clientEntries;
        clientEntries.forEach(function(clientEntry) {
          var setting = {
            verify: true,
            path: clientEntry.path,
            tmp: App.getPath('userCache')
          };

          addClient(clientEntry, setting);
        });

        window.webContents.send('clientsList-refresh', getClientEntries());
      }
    });
  }

  function save() {
    Jsonfile.writeFile(ENTRIES_JSON_FILE_PATH, clientEntries, function (err) {
      //
    });
  }

  function bindIpc(mainWindow) {
    window = mainWindow;

    Ipc.on('manager-addClient', function(event, torrentSource) {
      if (getItemBy(clientEntries, 'torrentSource', torrentSource)) {
        Dialog.showMessageBox({
          type:    'error',
          buttons: ['ok'],
          title:   'Duplicate torrent',
          message: 'Duplicate torrent',
          detail:  'This torrent is already exist in the queue.'
        }, function() {
          //
        });
        return;
      }

      Dialog.showOpenDialog({
        title: 'Select Download Path',
        properties: ['openDirectory']
      }, function (downloadPath) {
        if (downloadPath) {
          var hash  = Md5(torrentSource + (new Date().getTime())),
              entry = {
                controlHash: hash,
                torrentSource: torrentSource,
                path: downloadPath[0]
              },
              setting = {
                verify: true,
                path: downloadPath[0],
                tmp: App.getPath('userCache')
              };


          addClient(entry, setting);
          addClientEntry(entry);

          event.sender.send('clientsList-refresh', getClientEntries());
        }
      });
    });

    Ipc.on('manager-removeClient', function(event, controlHash) {
      var _client = getItemBy(clients, 'controlHash', controlHash);

      if (!_client.is('done') && !_client.is('stop')) { _client.stop(); }

      removeClientEntry(controlHash);
      removeClient(controlHash);

      event.sender.send('clientsList-refresh', getClientEntries());
    });

    Ipc.on('manager-requestRefresh', function(event) {
      event.sender.send('clientsList-refresh', getClientEntries());
    });
  }

  return {
    bindIpc: bindIpc,
    restore: restore
  };
}

module.exports = new Manager;
