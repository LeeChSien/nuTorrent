var fs           = require("fs")
var parseTorrent = require('parse-torrent')
var Md5          = require('md5')
var Defer        = require("node-promise").defer

var App     = require('app')
var Ipc     = require('ipc')
var Dialog  = require('dialog')

var Client  = require('./client')
var LocalStorage  = require('./local-storage')

var GlobalState = require('./global-state')

var clients = [];


// Array utils

function removeItemBy(array, key, value){
  for (var i in array) {
    if (array[i][key] == value) {
      array.splice(i,1);
      break;
    }
  }
}

function getItemBy(array, key, value){
  for (var i in array) {
    if (array[i][key] == value) {
      return array[i];
    }
  }
  return null;
}


var Manager = function() {
  // Private

  function addClient(magnet, path) {
    var controlHash  = Md5(magnet + (new Date().getTime())),
        setting = {
          verify: true,
          path: path ? path : null,
          tmp: App.getPath('userCache'),
          connections: 30
        },
        client = new Client();

    client.setup(controlHash, magnet, setting);
    clients.push(client);
    LocalStorage.saveClients(getClients());
  }

  function removeClient(controlHash) {
    var _client = getItemBy(clients, 'controlHash', controlHash);
    if (_client) {
      _client.teardown();
      removeItemBy(clients, 'controlHash', controlHash);

      LocalStorage.saveClients(getClients());
    }
  }

  function restoreClients() {
    LocalStorage.getClients().then(function(existClients) {
      existClients.forEach(function(clientAttributes) {
        var client = new Client();
        client.restore(clientAttributes);
        clients.push(client);
      });
    });
  }

  function getClients() {
    return clients.map(function(client) {
      return client.getAttributes();
    });
  }

  function getClient(index) {
    return clients[index];
  }

  // Public

  function restore() {
    restoreClients()
  }

  function quit() {
    var deferred = Defer();
    LocalStorage.saveClients(getClients()).then(function() {
      deferred.resolve();
    });
    return deferred.promise;
  }

  function openUrl(magnet) {
    if (getItemBy(clients , 'magnet', magnet)) {
      Dialog.showMessageBox({
        type:    'error',
        buttons: ['ok'],
        title:   'Duplicate torrent',
        message: 'Duplicate torrent',
        detail:  'This torrent is already exist in the queue.'
      }, function() {  });
      return;
    }

    Dialog.showOpenDialog({
      title: 'Select download path',
      properties: ['openDirectory']
    }, function (paths) {
      if (paths) {
        addClient(magnet, paths[0]);

        var Window  = GlobalState.getWindow();
        if (Window) {Window.webContents.send('client-list-refresh', getClients()); }
      }
    });
  }

  function openFile(file) {
    var result = parseTorrent(fs.readFileSync(file)),
        magnet = parseTorrent.toMagnetURI(result);

    if (getItemBy(clients , 'magnet', magnet)) {
      Dialog.showMessageBox({
        type:    'error',
        buttons: ['ok'],
        title:   'Duplicate torrent',
        message: 'Duplicate torrent',
        detail:  'This torrent is already exist in the queue.'
      }, function() {  });
      return;
    }

    Dialog.showOpenDialog({
      title: 'Select download path',
      properties: ['openDirectory']
    }, function (paths) {
      if (paths) {
        addClient(magnet, paths[0]);

        var Window  = GlobalState.getWindow();
        if (Window) {Window.webContents.send('client-list-refresh', getClients()); }
      }
    });
  }

  function bindIpc() {
    Ipc.on('add-client-from-magnet', function(event, magnet) {
      openUrl(magnet);
    });

    Ipc.on('add-client-from-torrent', function(event) {
      Dialog.showOpenDialog({
        title: 'Open torrent',
        properties: ['openFile'],
        filters: [
          { name: 'torrent', extensions: ['torrent'] }
        ]
      }, function (torrentPaths) {
        if (torrentPaths) {
          openFile(torrentPaths[0]);
        }
      });
    });


    Ipc.on('client-remove', function(event, controlHashes) {
      controlHashes.forEach(function(controlHash) {
        removeClient(controlHash);
      });
      event.sender.send('client-list-refresh', getClients());
    });

    Ipc.on('client-stop', function(event, controlHashes) {
      controlHashes.forEach(function(controlHash) {
        var c = getItemBy(clients , 'controlHash', controlHash)
        if (c && c.can('stop')) { c.stop(); }
      });
    });

    Ipc.on('client-resume', function(event, controlHashes) {
      controlHashes.forEach(function(controlHash) {
        var c = getItemBy(clients , 'controlHash', controlHash)
        if (c && c.can('resume')) { c.resume(); }
      });
    });

    Ipc.on('client-open-path', function(event, controlHashes) {
      controlHashes.forEach(function(controlHash) {
        var c = getItemBy(clients , 'controlHash', controlHash)
        if (c) { c.openPath(); }
      });
    });

    Ipc.on('request-client-list-refresh', function(event, controlHash) {
      event.sender.send('client-list-refresh', getClients());
    });
  }

  return {
    bindIpc: bindIpc,
    restore: restore,
    openFile: openFile,
    openUrl: openUrl,
    quit: quit
  };
}

module.exports = new Manager;
