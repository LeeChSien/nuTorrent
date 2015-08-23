import React from 'react'
import { Route, DefaultRoute } from 'react-router'

import AppContainer from '../containers/AppContainer'

import QueueAllContainer from '../containers/QueueAllContainer'
import QueueDownloadContainer from '../containers/QueueDownloadContainer'
import QueueStopContainer from '../containers/QueueStopContainer'
import QueueCompleteContainer from '../containers/QueueCompleteContainer'

import PageSettingContainer from '../containers/PageSettingContainer'
import PageAboutContainer from '../containers/PageAboutContainer'


export default (
  <Route path="/" handler={AppContainer}>
    <DefaultRoute name="queue_all" handler={QueueAllContainer} />
    <Route name="queue_download" handler={QueueDownloadContainer} />
    <Route name="queue_stop" handler={QueueStopContainer} />
    <Route name="queue_complete" handler={QueueCompleteContainer} />
    <Route name="page_setting" handler={PageSettingContainer} />
    <Route name="page_about" handler={PageAboutContainer} />
  </Route>
)
