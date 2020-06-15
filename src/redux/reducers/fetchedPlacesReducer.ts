import { Draft, produce } from 'immer'
import { AppAction } from '../actionTypes'
import { FetchedPlaces } from '../state'
import { AppReducer } from './appReducer'

export const fetchedPlacesReducer: AppReducer<FetchedPlaces> = produce(
    (fetchedPlaces: Draft<FetchedPlaces>, action: AppAction) => {
        switch (action.type) {
            case 'FETCH_PLACE_IN_PROGRESS':
                fetchedPlaces[action.address] = {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                }
                break
            case 'FETCH_PLACE_SUCCESS':
                fetchedPlaces[action.address] = {
                    status: 'SUCCESS',
                    result: action.place,
                }
                break
            case 'FETCH_PLACE_FAILED':
                fetchedPlaces[action.address] = {
                    status: 'FAILED',
                    error: action.error,
                }
                break
        }
    },
    {},
)
