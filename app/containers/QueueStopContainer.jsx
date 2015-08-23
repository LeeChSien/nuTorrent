import React from 'react'
import { Link } from 'react-router'

import QueuePanel from '../components/QueuePanel'

export default class QueueStopContainer extends React.Component {

  render() {
    const queue = 'stop';

    return (
      <div className="col-sm-9">
        <QueuePanel queue={queue}/>
      </div>
    )
  }

}
