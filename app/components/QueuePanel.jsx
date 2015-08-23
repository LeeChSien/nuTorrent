import React from 'react/addons'
import { ProgressBar, Tooltip, OverlayTrigger, Modal, Button } from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn, TableDataSet } from 'react-bootstrap-table';

import Ipc from 'ipc'

export default class QueuePanel extends React.Component {
  static defaultProps = {
    clients: [],
    selectedClients: {}
  }

  constructor(props) {
    super(props);

    this.state = {
      showMagnetModal: false,
      magnetUrl: '',
      invalidMagnetUrl: false,

      showRemoveModal: false,

      clientsLength: 0
    };

    this.props.clients = [];
    this.clients = new TableDataSet(this.props.clients);

    // Clear previos events
    Ipc.removeAllListeners('client-list-refresh');
    Ipc.removeAllListeners('client-refresh');

    // Bind events
    Ipc.on('client-list-refresh', (clients) => {
      if (this.props.queue != 'all') {
        clients.forEach((client) => {
          if (client.state == this.props.queue) { this.props.clients.push(client); }
        });
      } else {
        this.props.clients = clients;
      }

      this.clients.setData(this.props.clients);
      this.setState({clientsLength: this.props.clients.length});
    });

    Ipc.on('client-refresh', (client) => {
      for (var i = 0; i < this.props.clients.length; i++) {
        if (this.props.clients[i]['controlHash'] == client['controlHash']) {
          this.props.clients[i] = client;
          this.clients.setData(this.props.clients);
          break;
        }
      }
    });

    Ipc.send('request-client-list-refresh');
  }

  onCliensSelect(row, isSelected){
    this.props.selectedClients[row['controlHash']] = (isSelected) ? true : false;
  }

  onSelectAllClient(isSelected){
    for (var i = 0; i < this.props.clients.length; i++) {
      this.props.selectedClients[this.props.clients[i]['controlHash']] = (isSelected) ? true : false;
    }
  }

  closeMagnetModal() {
    this.setState({
      showMagnetModal: false,
      magnetUrl: '',
      invalidMagnetUrl: false
    });
  }

  openMagnetModal() {
    this.setState({ showMagnetModal: true });
  }

  handleMagnetUrlChange(event) {
    this.setState({ magnetUrl: event.target.value });
  }

  openRemoveModal() {
    if (this.getSelectedClients().length > 0) { this.setState({ showRemoveModal: true }); }
  }

  closeRemoveModal() {
    this.setState({ showRemoveModal: false });
  }

  addMagnetUrl() {
    if (this.state.magnetUrl.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) != null) {
      Ipc.send('add-client-from-magnet', this.state.magnetUrl);
      this.closeMagnetModal();
    } else {
      this.setState({ invalidMagnetUrl: true });
    }
  }

  addTorrent() {
    Ipc.send('add-client-from-torrent');
  }

  getSelectedClients() {
    var controlHashes = [];
    for (var controlHash in this.props.selectedClients) {
      if (this.props.selectedClients[controlHash]) {
        controlHashes.push(controlHash)
      }
    }
    return controlHashes;
  }

  resume() {
    Ipc.send('client-resume', this.getSelectedClients());
  }

  stop() {
    Ipc.send('client-stop', this.getSelectedClients());
  }

  remove() {
    Ipc.send('client-remove', this.getSelectedClients());
    this.closeRemoveModal();
  }

  openPath() {
    Ipc.send('client-open-path', this.getSelectedClients());
  }

  // Formatter

  dataRateStringFormatter(dataRate) {
    if (!dataRate) { return 0; }

    var KByte = dataRate/1024,
        MByte = KByte/1024;

    return (KByte > 1000) ?
            ((MByte).toFixed(2) + ' MB/s') :
            ((KByte).toFixed() + ' KB/s');
  }

  sizeStringFormatter(size) {
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

  nameFormatter(cell, row) {
    const nameTooltip = (
          <Tooltip>{cell}</Tooltip>
        );

    return cell ?
      (<h5>
        <OverlayTrigger placement='bottom' overlay={nameTooltip}>
          <a>{cell}</a>
        </OverlayTrigger>
      </h5>) :
      (<h5>
        Initializing...
      </h5>);
  }

  progressFormatter(cell, row) {
    let progress = (cell * 100).toFixed(1),
        progressBarActive = (row.state == 'download') ? true : false,
        progressBarStyle  = (row.state == 'done') ?
          'success' : ((row.state == 'stop') ?
            'warning' : 'info');

    return (<ProgressBar active={progressBarActive} bsStyle={progressBarStyle}
      now={progress} label='%(percent)s%' />);
  }

  sizeFormatter(cell, row) {
    return this.sizeStringFormatter(cell);
  }

  downlinkFormatter(cell, row) {
    let downlink = this.dataRateStringFormatter(cell);

    return (
      <span className="label label-info">
        {downlink} <span className="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>
      </span>
    );
  }

  uplinkFormatter(cell, row) {
    let uplink = this.dataRateStringFormatter(cell);

    return (
      <span className="label label-warning">
        {uplink} <span className="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>
      </span>
    );
  }

  render() {
    let selectRowProp = {
      mode: "checkbox",
      clickToSelect: true,
      bgColor: "#E0FFFF",
      onSelect: this.onCliensSelect.bind(this),
      onSelectAll: this.onSelectAllClient.bind(this)
    };

    return (
      <div>
        <nav className="navbar navbar-default navbar-static-top queue-panel-nav">
          <button type="button" className="btn btn-default navbar-btn" onClick={this.openMagnetModal.bind(this)}>
            <span className="glyphicon glyphicon-plus"></span> Magnet url
          </button>
          <button type="button" className="btn btn-default navbar-btn" onClick={this.addTorrent.bind(this)}>
            <span className="glyphicon glyphicon-plus"></span> Torrent
          </button>

          <div className="btn-group" role="group" aria-label="actions">
            <button type="button" className="btn btn-default" onClick={this.resume.bind(this)}>
              <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
            </button>
            <button type="button" className="btn btn-default" onClick={this.stop.bind(this)}>
              <span className="glyphicon glyphicon-stop" aria-hidden="true"></span>
            </button>
            <button type="button" className="btn btn-default" onClick={this.openRemoveModal.bind(this)}>
              <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
            </button>
            <button type="button" className="btn btn-default" onClick={this.openPath.bind(this)}>
              <span className="glyphicon glyphicon-folder-open" aria-hidden="true"></span>
            </button>
          </div>
        </nav>

        <div className={(this.state.clientsLength == 0) ? 'hide' : ''}>
          <BootstrapTable data={this.clients} selectRow={selectRowProp}>
            <TableHeaderColumn dataField="controlHash" isKey={true} hidden={true}></TableHeaderColumn>

            <TableHeaderColumn dataField="name" width="200px" dataSort={true} dataFormat={this.nameFormatter}>Name</TableHeaderColumn>
            <TableHeaderColumn dataField="progress" dataSort={true} dataFormat={this.progressFormatter}>Progress</TableHeaderColumn>
            <TableHeaderColumn dataField="size" width="100px" dataSort={true} dataFormat={this.sizeFormatter.bind(this)}>Size</TableHeaderColumn>
            <TableHeaderColumn dataField="downlink" width="100px" dataSort={true} dataFormat={this.downlinkFormatter.bind(this)}>Downlink</TableHeaderColumn>
            <TableHeaderColumn dataField="uplink" width="100px" dataSort={true} dataFormat={this.uplinkFormatter.bind(this)}>Uplink</TableHeaderColumn>
          </BootstrapTable>
        </div>

        { (this.state.clientsLength == 0) ? <h4 className="text-center no-task"> No task.</h4> : null }

        <Modal show={this.state.showMagnetModal} onHide={this.closeMagnetModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Add magnet url</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Add magnet link"
                  onChange={this.handleMagnetUrlChange.bind(this)} />
                <span className="input-group-btn">
                  <button className="btn btn-primary" type="button" onClick={this.addMagnetUrl.bind(this)}>Add</button>
                </span>
              </div>
            </div>
            <br />
            { this.state.invalidMagnetUrl ? <div className="alert alert-danger" role="alert">Invalid magnet url</div> : null }
          </Modal.Body>
        </Modal>

        <Modal show={this.state.showRemoveModal} onHide={this.closeRemoveModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Remove</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure?
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeRemoveModal.bind(this)}>Close</Button>
            <Button onClick={this.remove.bind(this)} bsStyle='danger'>Remove</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }

}
