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
    };

    Ipc.on('clientsList-refresh', function(clientEntries) {
      self.setState({ clientEntries: clientEntries });
    });

    Ipc.send('manager-requestRefresh');
  }

  handleRemove(i) {
    this.remove(i);
  }

  remove(i) {
    Ipc.send('manager-removeClient',
      this.state.clientEntries[i].controlHash);

    this.setState({clientEntries:
      React.addons.update(this.state.clientEntries, {$splice: [[i, 1]]})});
  }

  render() {
    var self = this;
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
      </div>
    )
  }

}
