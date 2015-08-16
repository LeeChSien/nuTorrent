import React from 'react'
import { Route, DefaultRoute } from 'react-router'
import AppContainer from '../containers/AppContainer'
import MainPanelContainer from '../containers/MainPanelContainer'
import AboutPageContainer from '../containers/AboutPageContainer'


export default (
  <Route path="/" handler={AppContainer}>
    <DefaultRoute name="main" handler={MainPanelContainer} />
    <Route name="about" handler={AboutPageContainer} />
  </Route>
)
