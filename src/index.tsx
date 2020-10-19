import ApolloClient from 'apollo-boost'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { App } from './components/App'
import { GetTokenQuery, GetTokenQueryVariables } from './generated/graphql'
import { GetToken } from './queries'
import store from './redux/store'

export const appVersion = '2020.10.18'
export const apolloClient = new ApolloClient({ uri: 'https://api.quickroute.rizadh.com/graphql' })

// tslint:disable-next-line:no-var-requires
require('babel-polyfill')

mapkit.init({
    authorizationCallback: done =>
        apolloClient
            .query<GetTokenQuery, GetTokenQueryVariables>({
                query: GetToken,
                variables: { origin: self.origin },
                fetchPolicy: 'no-cache',
            })
            .then(result => done(result.data.mapkitToken)),
})

const providedApp = (
    <Provider store={store}>
        <App />
    </Provider>
)

render(providedApp, document.getElementById('root'))
