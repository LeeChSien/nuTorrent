var Util = require('util')
var Open = require("open")

var TorrentStream = require('./torrent-stream/index')
var StateMachine  = require('javascript-state-machine')

var Ipc = require('ipc')
var GlobalState = require('./global-state')


var PROGRESS_CHECKER_INTERVAL = 1000;

var Client = function() {
  // Private
  this._setting = {};
  this._engine = null;
  this._progressIntervalChecker = null;
  this._lastSwarm = null;

  this._name = null;
  this._progress = 0;
  this._size = 0;
  this._torrentHash = null;
  this._currentDataRate = {
    download: 0,
    upload: 0
  };

  // Public
  this.controlHash = '';
  this.magnet = '';
};

Client.prototype = {
  // State transition callbacks
  onenterrestore: function(event, from, to, attributes) {
    var self = this, clonedSetting;

    this.controlHash = attributes.controlHash;
    this.magnet = attributes.magnet;
    this._progress = attributes.progress;
    this._setting = attributes.setting;

    clonedSetting = JSON.parse(JSON.stringify(this._setting));

    self._engine = TorrentStream(this.magnet, clonedSetting);
    self._engine.on('ready', function() {
      self._name        = self._engine.torrent.name;
      self._size        = self._engine.torrent.length;
      self._torrentHash = self._engine.torrent.infoHash;

      if (attributes.state == 'stop') {
        self.stop();
      } else {
        self.ready();
      }

    });
  },

  onenterresume: function(event, from, to) {
    this._updateView();
    this.setup();
  },

  onentersetup: function(event, from, to, controlHash, magnet, setting) {
    var self = this, clonedSetting;

    if (controlHash && magnet && setting) {
      this._setting = setting;
      this.controlHash = controlHash;
      this.magnet = magnet;
    }

    clonedSetting = JSON.parse(JSON.stringify(this._setting));

    self._engine = TorrentStream(this.magnet, clonedSetting);
    self._engine.on('ready', function() {
      self._name        = self._engine.torrent.name;
      self._size        = self._engine.torrent.length;
      self._torrentHash = self._engine.torrent.infoHash;

      self.ready();
    });
  },

  onenterready: function(event, from, to) {
    this.download();
  },

  onenterdownload: function(event, from, to) {
    this._engine.files.forEach(function(file) {
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
  _caculateDataRate: function() {
    if (this._lastSwarm) {
      this._currentDataRate = {
        download: (this._engine.swarm.downloaded - this._lastSwarm.downloaded) /
          (PROGRESS_CHECKER_INTERVAL / 1000),
        upload: (this._engine.swarm.uploaded - this._lastSwarm.uploaded) /
          (PROGRESS_CHECKER_INTERVAL / 1000)
      };
    }

    this._lastSwarm = {
      downloaded: this._engine.swarm.downloaded,
      uploaded: this._engine.swarm.uploaded,
    };
  },

  _updateView: function() {
    var Window  = GlobalState.getWindow();
    if (Window) {Window.webContents.send('client-refresh', this.getAttributes()); }
  },

  _intervelProgressChecker: function() {
    // Check progress
    this._progress = this._engine.getProgress();

    // Calculate Data Rate
    this._caculateDataRate();

    // Update View
    this._updateView();

    // Check if complete
    if (this._progress == 1) { this.complete(); }
  },

  _allocateIntervelProgressChecker: function() {
    this._progressIntervalChecker =
      !this._progressIntervalChecker ?
        setInterval(this._intervelProgressChecker.bind(this), PROGRESS_CHECKER_INTERVAL) :
        this._progressIntervalChecker;
  },

  _releaseIntervelProgressChecker: function() {
    if (this._progressIntervalChecker) {
      clearInterval(this._progressIntervalChecker);
      this._progressIntervalChecker = null
    }
  },

  // Public function
  getAttributes: function() {
    return {
      state:       this.current,
      name:        this._name,
      progress:    this._progress,
      size:        this._size,
      downlink:    this._currentDataRate.download,
      uplink:      this._currentDataRate.upload,
      torrentHash: this._torrentHash,
      controlHash: this.controlHash,
      magnet:      this.magnet,
      setting:     this._setting
    };
  },

  openPath: function() {
    // TODO test _setting will not be clean
    Open(this._setting.path);
  },

  teardown: function() {
    this._releaseIntervelProgressChecker();
    if (this._engine) { this._engine.destroy(); }
    this._lastSwarm = null;

    this._currentDataRate = {
      download: 0,
      upload: 0
    };

    this._updateView();
  }
};

StateMachine.create({
  target: Client.prototype,
  events: [
    { name: 'restore',  from: 'none',                  to: 'restore'  },
    { name: 'setup',    from: ['none', 'resume'],      to: 'setup'  },
    { name: 'ready',    from: ['setup', 'restore'],    to: 'ready'  },
    { name: 'download', from: 'ready',                 to: 'download' },
    { name: 'stop',     from: ['download', 'restore'], to: 'stop' },
    { name: 'resume',   from: 'stop',                  to: 'resume' },
    { name: 'complete', from: 'download',              to: 'done' },
  ]});

module.exports = Client;
