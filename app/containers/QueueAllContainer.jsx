import React from 'react'
import { Link } from 'react-router'

import QueuePanel from '../components/QueuePanel'

export default class QueueAllContainer extends React.Component {

  render() {
    const queue = 'all';

    return (
      <div className="col-sm-9">
        <QueuePanel queue={queue} />
      </div>
    )
  }

}
