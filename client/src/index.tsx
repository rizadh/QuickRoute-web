// tslint:disable-next-line:no-reference
/// <reference path="./declarations/mapkit.d.ts" />

import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import store from './redux/store'

export const appVersion = 'v2019.03.23'

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

render(<Provider store={store}><App store={store} /></Provider>, document.getElementById('root'))
