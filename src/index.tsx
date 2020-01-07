import React from 'react'
import { render } from 'react-dom'
import { App } from './components/App'

export const appVersion = '2020.01.07'
export const apiPrefix = 'https://api.quickroute.rizadh.com/'

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

mapkit.init({
    authorizationCallback: done =>
        fetch(apiPrefix + 'token')
            .then(res => res.text())
            .then(done),
})

render(<App />, document.getElementById('root'))
