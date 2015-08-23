import React from 'react'
import { Link } from 'react-router'
import { Input } from 'react-bootstrap'

export default class PageSettingContainer extends React.Component {

  render() {
    return (
      <div className="col-sm-9 page">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Setting</h3>
          </div>
          <div className="panel-body">
            <form className='form-horizontal'>
              <Input type='text' label='Default Download Path' labelClassName='col-xs-4' wrapperClassName='col-xs-8' />
              <Input type='number' label='Connections' labelClassName='col-xs-4' wrapperClassName='col-xs-8' />
              <Input type='textarea' label='Additional Trackers ' labelClassName='col-xs-4' wrapperClassName='col-xs-8' />
              <Input type='checkbox' label='DHT' wrapperClassName='col-xs-offset-4 col-xs-8' />
            </form>
          </div>
        </div>
      </div>
    )
  }

}
