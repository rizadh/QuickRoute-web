// tslint:disable-next-line:no-reference
/// <reference path="./declarations/mapkit.d.ts" />

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { App } from './components/App'
import store from './redux/store'

export const appVersion = 'v2019.04.18'

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

const app = (
    <Provider store={store}>
        <App />
    </Provider>
)

render(app, document.getElementById('root'))
