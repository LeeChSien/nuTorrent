import React from 'react/addons'
import { Modal, Button } from 'react-bootstrap'
import Client  from '../components/Client'
import Ipc from 'ipc'

export default class ClientList extends React.Component {
  constructor(props) {
    super(props);
    var self = this;

    this.state = {
      clientEntries: [],
      removeIndex: -1,
      showRemoveModal: false
    };

    Ipc.on('clientsList-refresh', function(clientEntries) {
      self.setState({ clientEntries: clientEntries });
    });

    Ipc.send('manager-requestRefresh');
  }

  handleRemove(i) {
    this.setState({
      removeIndex: i,
      showRemoveModal: true
    });
  }

  remove() {
    Ipc.send('manager-removeClient',
      this.state.clientEntries[this.state.removeIndex].controlHash);

    this.setState({clientEntries:
      React.addons.update(this.state.clientEntries, {$splice: [[this.state.removeIndex, 1]]})});

    this.closeRemoveModal();
  }

  closeRemoveModal() {
    this.setState({
      removeIndex: -1,
      showRemoveModal: false
    });
  }

  render() {
    let self = this;
    return (
      <div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Progress</th>
                <th>Size</th>
                <th>Downlink</th>
                <th>Uplink</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {this.state.clientEntries.map(function(clientEntry, i) {
                return <Client key={clientEntry.controlHash} clientEntry={clientEntry} onRemove={self.handleRemove.bind(self, i)}></Client>;
              })}
            </tbody>
          </table>

          { (this.state.clientEntries.length == 0) ? <h5 className="text-center"> No Task</h5> : null }
        </div>

        <Modal show={this.state.showRemoveModal} onHide={this.closeRemoveModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Remove Torrent</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure?</p>
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
