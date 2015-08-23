import React from 'react'
import { Link } from 'react-router'

import ManagerPanel from '../components/ManagerPanel'

export default class MainContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <ManagerPanel></ManagerPanel>
        <Link to="main">back Home</Link>
      </div>
    )
  }

}
