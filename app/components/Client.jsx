import React from 'react'
import { ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap'

import Ipc from 'ipc'

export default class Client extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clientInfo: {
        state: 'none',
        torrentInfo: {},
        torrentHash: '',
        torrentName: '',
        progress: 0,
        currentDataRate: {}
      },
      entry: props.clientEntry,
      desiredState: 'download',
    }

    var self = this,
        ipcEventName = 'client-refresh-' + this.state.entry.controlHash;

    Ipc.on(ipcEventName, function(clientInfo) {
      console.log(clientInfo);
      self.setState({ clientInfo: clientInfo });
    });
  }

  // Client Action
  stop() {
    var ipcEventName = 'client-stop-' + this.state.entry.controlHash;
    this.setState({desiredState: 'stop'});
    Ipc.send(ipcEventName);

  }

  resume() {
    var ipcEventName = 'client-resume-' + this.state.entry.controlHash;
    this.setState({desiredState: 'download'});
    Ipc.send(ipcEventName);
  }

  openPath() {
    var ipcEventName = 'client-openPath-' + this.state.entry.controlHash;
    Ipc.send(ipcEventName);
  }

  // Formatter
  dataRateFormatter(dataRate) {
    if (!dataRate) { return 0; }

    var KByte = dataRate/1024,
        MByte = KByte/1024;

    return (KByte > 1000) ?
            ((MByte).toFixed(2) + ' MB/s') :
            ((KByte).toFixed() + ' KB/s');
  }

  sizeFormatter(size) {
    if (!size) { return 0; }

    var KByte = size/1024,
        MByte = KByte/1024,
        GByte = MByte/1024;

    return (MByte > 1000) ?
            ((GByte).toFixed(2) + ' GB') :
              ((KByte > 1000) ?
                ((MByte).toFixed(2) + ' MB') :
                ((KByte).toFixed() + ' KB'));
  }

  render() {
    const nameTooltip = (
          <Tooltip>{name}</Tooltip>
        );

    let name = (this.state.clientInfo.state == 'none') ?
          'Initializing torrent...' : this.state.clientInfo.torrentName;

    let progress = (this.state.clientInfo.progress*100).toFixed(1),
        progressBarActive = (this.state.clientInfo.state == 'download') ? true : false,
        progressBarStyle  = (this.state.clientInfo.state == 'done') ? 'success' : 'primary';

    let size = this.sizeFormatter(this.state.clientInfo.torrentInfo.length);

    let downlink = (this.state.clientInfo.state == 'download') ?
          this.dataRateFormatter(this.state.clientInfo.currentDataRate.download) : 0,
        uplink   = (this.state.clientInfo.state == 'download') ?
          this.dataRateFormatter(this.state.clientInfo.currentDataRate.upload) : 0;

    return (
      <tr>
        <td>
          <OverlayTrigger placement='bottom' overlay={nameTooltip}>
            <a className="truncate">
              {name}
            </a>
          </OverlayTrigger>
        </td>
        <td>
          <div className="torrent-progress">
            <ProgressBar active={progressBarActive} bsStyle={progressBarStyle}
              now={progress} label='%(percent)s%' />
          </div>
        </td>
        <td>
          <div className="torrent-size">{size}</div>
        </td>
        <td>
          <div className="label-speed">
            <span className="label label-success">
              {downlink}
              <span className="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>
            </span>
          </div>
        </td>
        <td>
          <div className="label-speed">
            <span className="label label-warning label-speed">
              {uplink}
              <span className="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>
            </span>
          </div>
        </td>
        <td className="torrent-actions text-center">
          <div className="btn-group" role="group" aria-label="client-actions">
            { (this.state.clientInfo.state == 'stop') ?
              <button type="button" className="btn btn-default btn-xs" onClick={this.resume.bind(this)}
                disabled={this.state.desiredState != this.state.clientInfo.state}>
                <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
              </button> : null }

            { (this.state.clientInfo.state == 'download') ?
              <button type="button" className="btn btn-default btn-xs" onClick={this.stop.bind(this)}
                disabled={this.state.desiredState != this.state.clientInfo.state}>
                <span className="glyphicon glyphicon-stop" aria-hidden="true"></span>
              </button> : null }

            { (this.state.clientInfo.state != 'none') ?
              <button type="button" className="btn btn-default btn-xs">
                <span className="glyphicon glyphicon-trash" aria-hidden="true" onClick={this.props.onRemove.bind(this)}></span>
              </button> : null }

            { (this.state.clientInfo.state != 'none') ?
              <button type="button" className="btn btn-default btn-xs">
                <span className="glyphicon glyphicon-folder-open" aria-hidden="true" onClick={this.openPath.bind(this)}></span>
              </button> : null }
          </div>
        </td>
      </tr>
    )
  }

}
