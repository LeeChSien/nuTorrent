import React from 'react'
import { RouteHandler } from 'react-router'
import { Link } from 'react-router'

import Sidebar from '../components/Sidebar'

export default class AppContainer extends React.Component {

  render() {
    return (
      <div className="row app-full-height">
        <Sidebar />
        <RouteHandler />
      </div>
    )
  }

}
