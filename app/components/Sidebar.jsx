import React from 'react'
import { Link } from 'react-router'

export default class Sidebar extends React.Component {

  render() {
    return (
      <div className="col-sm-3 app-full-height">
        <div className="sidebar app-full-height">
          <div className="brand">
            <img src="../icon/res/mipmap-mdpi/ic_launcher.png" />
          </div>
          <div className="list-group">
            <Link to="queue_all" className="list-group-item">All</Link>
            <Link to="queue_download" className="list-group-item">Downloading</Link>
            <Link to="queue_stop" className="list-group-item">Stop</Link>
            <Link to="queue_complete" className="list-group-item">Complete</Link>
          </div>
          <hr />
          <div className="list-group">
            <Link to="page_about" className="list-group-item">About</Link>
          </div>
        </div>
      </div>
    )
  }

}
