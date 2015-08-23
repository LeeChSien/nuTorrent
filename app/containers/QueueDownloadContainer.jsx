import React from 'react'
import { Link } from 'react-router'

import QueuePanel from '../components/QueuePanel'

export default class QueueDownloadContainer extends React.Component {

  render() {
    const queue = 'download';

    return (
      <div className="col-sm-9">
        <QueuePanel queue={queue} />
      </div>
    )
  }

}
