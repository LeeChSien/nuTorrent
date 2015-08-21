import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import Ipc from 'ipc'

import ClientList  from '../components/ClientList'

export default class ManagerPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddModal: false,
      magnetLink: '',
      invalidMagnetLink: false,
    };
  }

  closeAddModal() {
    this.setState({
      showAddModal: false,
      magnetLink: '',
      invalidMagnetLink: false,
    });
  }

  openAddModal() {
    this.setState({ showAddModal: true });
  }

  addMagnetLink() {
    if (this.state.magnetLink.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i) != null) {
      Ipc.send('manager-addClient', this.state.magnetLink);
      this.closeAddModal();
    } else {
      this.setState({ invalidMagnetLink: true });
    }
  }

  handleMagnetLinkChange(event) {
    this.setState({ magnetLink: event.target.value });
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">
            <button type="button" className="btn btn-default navbar-btn pull-right" onClick={this.openAddModal.bind(this)}>
              <span className="glyphicon glyphicon-plus"></span> Add Torrent
            </button>
          </div>
        </nav>

        <ClientList></ClientList>

        <Modal show={this.state.showAddModal} onHide={this.closeAddModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Torrent</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Add magnet link"
                  onChange={this.handleMagnetLinkChange.bind(this)} />
                <span className="input-group-btn">
                  <button className="btn btn-primary" type="button" onClick={this.addMagnetLink.bind(this)}>Start</button>
                </span>
              </div>
            </div>

            <br />

            { this.state.invalidMagnetLink ? <div className="alert alert-danger" role="alert">Invalid magnet link!</div> : null }
          </Modal.Body>
        </Modal>
      </div>
    )
  }

}
