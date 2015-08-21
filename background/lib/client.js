var Util          = require('util');
var Events        = require('events');
var Open          = require("open");

var torrentStream = require('./torrent-stream/torrent-stream');
var StateMachine  = require('javascript-state-machine');

var Ipc           = require('ipc');

var PROGRESS_CHECKER_INTERVAL = 1000;

var Client = function(entry, setting) {
  // Private
  this._controlHash = entry.controlHash;
  this._setting = setting;

  this._engine = null;
  this._progress = 0;

  this._progress_interval_checker = null;
  this._last_swarm = null;

  this._eventEmitter = new Events.EventEmitter();
  this._ipcRefreshCallback = null;

  // Public
  this.current_data_rate = {
    download: 0,
    upload: 0
  };
  this.controlHash = entry.controlHash;
  this.torrentSource = entry.torrentSource;

  var self = this;

  // Construct Ipc event
  Ipc.on('client-stop-' + this._controlHash, function(event, torrentSource) {
    self.stop();
  });

  Ipc.on('client-resume-' + this._controlHash, function(event, torrentSource) {
    self.resume();
  });

  Ipc.on('client-openPath-' + this._controlHash, function(event, torrentSource) {
    Open(self._setting.path);
  });

  this.setup();
};

Client.prototype = {
  // State transition callbacks
  onentersetup: function(event, from, to) {
    var self = this,
        torrentSource = this.torrentSource,
        setting = this._setting;

    if (typeof torrentSource === 'string') {
      self._engine = torrentStream(torrentSource, setting); // torrentSource as magnet link
    } else {
      // torrentSource as .torrent file
    }

    self._engine.on('ready', function() {
      self.ready();
    });
  },

  onenterready: function(event, from, to) {
    this.download();
  },

  onenterdownload: function(event, from, to) {
    this._engine.files.forEach(function(file) {
      //console.log(file);
      file.createReadStream();
    });

    this._allocateIntervelProgressChecker();
  },

  onenterstop: function(event, from, to) {
    this.teardown();
  },

  onenterdone: function(event, from, to) {
    this.teardown();
  },

  // Private function
  _intervelProgressChecker: function() {
    // Check progress
    var progress = this._engine.getProgress();

    // Calculate Data Rate
    if (this._last_swarm) {
      this.current_data_rate = {
        download: (this._engine.swarm.downloaded - this._last_swarm.downloaded) / (PROGRESS_CHECKER_INTERVAL / 1000),
        upload: (this._engine.swarm.uploaded - this._last_swarm.uploaded) / (PROGRESS_CHECKER_INTERVAL / 1000)
      };
    }
    this._last_swarm = {
      downloaded: this._engine.swarm.downloaded,
      uploaded: this._engine.swarm.uploaded,
    };

    // Update ClientInfo through IPC
    if (this._ipcRefreshCallback) {
      this._ipcRefreshCallback(this.getInfo());
    }

    // Check if complete
    if (progress == 1) { this.complete(); }
  },
  _allocateIntervelProgressChecker: function() {
    this._progress_interval_checker =
      !this._progress_interval_checker ?
        setInterval(this._intervelProgressChecker.bind(this), PROGRESS_CHECKER_INTERVAL) :
        this._progress_interval_checker;
  },
  _releaseIntervelProgressChecker: function() {
    if (this._progress_interval_checker) {
      clearInterval(this._progress_interval_checker);
      this._progress_interval_checker = null
    }
  },

  // Public function
  getInfo: function() {
    return {
      state:           this.current,
      torrentInfo:     this._engine.torrent.info,
      torrentHash:     this._engine.torrent.infoHash,
      torrentName:     this._engine.torrent.name,
      progress:        this._engine.getProgress(),
      currentDataRate: this.current_data_rate
    };
  },
  setIpcRefreshCallback: function(callback) {
    this._ipcRefreshCallback = callback;
  },
  teardown: function() {
    this._releaseIntervelProgressChecker();

    if (this._ipcRefreshCallback) {
      this._ipcRefreshCallback(this.getInfo());
    }

    this._engine.destroy();
    this._last_swarm = null;
  }

};

StateMachine.create({
  target: Client.prototype,
  events: [
    { name: 'setup',    from: 'none',        to: 'setup'  },
    { name: 'ready',    from: 'setup',       to: 'ready'  },
    { name: 'download', from: 'ready',       to: 'download' },
    { name: 'stop',     from: 'download',    to: 'stop' },
    { name: 'resume',   from: 'stop',        to: 'setup' },
    { name: 'complete', from: 'download',    to: 'done' },
  ]});

module.exports = Client;
