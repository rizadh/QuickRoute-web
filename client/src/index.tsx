// tslint:disable-next-line:no-reference
/// <reference path="./declarations/mapkit.d.ts" />

import React from 'react'
import { render } from 'react-dom'
import { App } from './components/App'

export const appVersion = 'v2019.04.18'

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

render(<App />, document.getElementById('root'))
