import React from 'react'
import { Route, DefaultRoute } from 'react-router'
import AppContainer from '../containers/AppContainer'
import MainContainer from '../containers/MainContainer'
import AboutPageContainer from '../containers/AboutPageContainer'


export default (
  <Route path="/" handler={AppContainer}>
    <DefaultRoute name="main" handler={MainContainer} />
    <Route name="about" handler={AboutPageContainer} />
  </Route>
)
