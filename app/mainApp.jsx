import React from 'react'
import AppContainer from './containers/AppContainer'
import router from './routes/router'

import './styles/style.js'

window.location.hash = '/'

router.run(function (Handler) {
  React.render(<Handler />, document.getElementById('react-root'));
});
