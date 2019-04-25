import React from 'react'
import { render } from 'react-dom'
import { App } from './components/App'

export const appVersion = 'v2019.04.24'

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

render(<App />, document.getElementById('root'))
