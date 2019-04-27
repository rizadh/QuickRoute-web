import { Draft, produce } from 'immer'
import { AppReducer } from '.'
import { AppAction } from '../actionTypes'
import { FetchedPlaces } from '../state'

export const fetchedPlacesReducer: AppReducer<FetchedPlaces> = produce(
    (fetchedPlaces: Draft<FetchedPlaces>, action: AppAction) => {
        switch (action.type) {
            case 'FETCH_PLACE_IN_PROGRESS':
                // TODO: Can be set directly with Immer v4.0
                return new Map(fetchedPlaces as FetchedPlaces).set(action.address, {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                })
            case 'FETCH_PLACE_SUCCESS':
                // TODO: Can be set directly with Immer v4.0
                return new Map(fetchedPlaces as FetchedPlaces).set(action.address, {
                    status: 'SUCCESS',
                    result: action.place,
                })
            case 'FETCH_PLACE_FAILED':
                // TODO: Can be set directly with Immer v4.0
                return new Map(fetchedPlaces as FetchedPlaces).set(action.address, {
                    status: 'FAILED',
                    error: action.error,
                })
        }
    },
    new Map() as FetchedPlaces,
)
