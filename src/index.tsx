import ApolloClient from 'apollo-boost'
import React from 'react'
import { render } from 'react-dom'
import { App } from './components/App'
import { GetTokenQuery, GetTokenQueryVariables } from './generated/graphql'
import { GetToken } from './queries'

export const appVersion = '2020.02.01'
export const apolloClient = new ApolloClient({ uri: 'https://api.quickroute.rizadh.com/graphql' })

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

mapkit.init({
    authorizationCallback: done =>
        apolloClient
            .query<GetTokenQuery, GetTokenQueryVariables>({ query: GetToken })
            .then(result => done(result.data.token)),
})

render(<App />, document.getElementById('root'))
