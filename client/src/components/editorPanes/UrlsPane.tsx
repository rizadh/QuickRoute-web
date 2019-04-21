import copyToClipboard from 'copy-text-to-clipboard'
import { chunk } from 'lodash'
import { stringify } from 'query-string'
import React, { useCallback, useContext, useMemo } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { setEditorPane } from '../../redux/actions'
import { EditorPane } from '../../redux/state'
import { WaypointEditorTemplate } from '../WaypointEditor'

export const UrlsPane = () => {
    const { state, dispatch } = useContext(AppStateContext)
    const setEditorPaneWaypointList = useCallback(() => dispatch(setEditorPane(EditorPane.List)), [])

    const navigationUrls = useMemo(() => {
        return chunk(state.waypoints, 10)
            .map(waypoints => waypoints.map(w => w.address))
            .map(addresses => {
                const destination = addresses.pop()
                const parameters = {
                    api: 1,
                    destination,
                    travelmode: 'driving',
                    waypoints: addresses.length > 0 ? addresses.join('|') : undefined,
                }

                return 'https://www.google.com/maps/dir/?' + stringify(parameters)
            })
    }, [state])

    const openUrl = useCallback(
        (index: number) => () => {
            window.open(navigationUrls[index])
        },
        [navigationUrls],
    )

    const openAllUrls = useCallback(() => {
        navigationUrls.forEach(url => window.open(url))
    }, [navigationUrls])

    const copyUrl = useCallback(
        (index: number) => () => {
            copyToClipboard(navigationUrls[index])
        },
        [navigationUrls],
    )

    const copyAllUrls = useCallback(() => {
        copyToClipboard(navigationUrls.join('\n'))
    }, [navigationUrls])

    return (
        <WaypointEditorTemplate
            title="Links"
            errorMessage=""
            body={
                <>
                    {navigationUrls.map((url, index) => (
                        <div key={url} className="input-row">
                            <input type="text" value={url} readOnly={true} />
                            <button onClick={copyUrl(index)} className="btn btn-primary">
                                <i className="far fa-clipboard" />
                            </button>
                            <button onClick={openUrl(index)} className="btn btn-primary">
                                <i className="fas fa-external-link-alt" />
                            </button>
                        </div>
                    ))}
                </>
            }
            footer={
                <>
                    <button className="btn btn-primary" onClick={openAllUrls}>
                        <i className="fas fa-external-link-alt" /> Open All
                    </button>
                    <button className="btn btn-primary" onClick={copyAllUrls}>
                        <i className="far fa-clipboard" /> Copy All
                    </button>
                    <button className="btn btn-secondary" onClick={setEditorPaneWaypointList}>
                        <i className="fas fa-chevron-left" /> Back
                    </button>
                </>
            }
        />
    )
}
