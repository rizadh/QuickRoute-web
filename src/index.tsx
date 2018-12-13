/// <reference path="./declarations/mapkit.d.ts" />

import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import store from './redux/store'

require('babel-polyfill')

render(<Provider store={store}><App store={store} /></Provider>, document.getElementById('root'))