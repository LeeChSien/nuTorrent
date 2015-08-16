import React from 'react'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap';

export default class MainPanelContainer extends React.Component {

  static defaultProps = {

  }

  render() {
    return (

      <div>
        <h2>Main</h2>
        <Button bsStyle='primary'>Primary</Button>
        <p>About us.</p>
        <Link to="about">back Home</Link>
      </div>

    )
  }

}
