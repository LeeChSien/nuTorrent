import React from 'react'
import { Link } from 'react-router'

import sh from 'shell'

export default class PageAboutContainer extends React.Component {
  openUrl(url) {
    sh.openExternal(url)
  }

  render() {
    return (
      <div className="col-sm-9 page">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">About</h3>
          </div>
          <div className="panel-body">
            <div className="brand">
              <img src="../icon/res/mipmap-hdpi/ic_launcher.png" />
            </div>
            <p>nuTorrent(νTorrent) is a pure javascript BitTorrent client based on Electron, React, torrent-stream.</p>
            <hr />
            <p>MIT © LeeChSien <button className="btn btn-default btn-sm" onClick={this.openUrl.bind(this, 'https://github.com/LeeChSien/nuTorrent')}>Github Repo</button></p>
          </div>
        </div>
      </div>
    )
  }

}
