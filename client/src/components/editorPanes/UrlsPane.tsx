import copyToClipboard from 'copy-text-to-clipboard'
import { chunk } from 'lodash'
import { stringify } from 'query-string'
import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { EditorPane, WaypointEditorContext, WaypointEditorTemplate } from '../WaypointEditor'

export const UrlsPane = () => {
    const { state } = useContext(AppStateContext)
    const setEditorMode = useContext(WaypointEditorContext)
    const setEditorModeWaypointList = useCallback(() => setEditorMode(EditorPane.List), [setEditorMode])

    const openUrl = (index: number) => () => {
        window.open(navigationUrls()[index])
    }

    const openAllUrls = () => {
        navigationUrls().forEach(url => window.open(url))
    }

    const copyUrl = (index: number) => () => {
        copyToClipboard(navigationUrls()[index])
    }

    const copyAllUrls = () => {
        copyToClipboard(navigationUrls().join('\n'))
    }

    const navigationUrls = () => {
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
    }

    return (
        <WaypointEditorTemplate
            title="Links"
            errorMessage=""
            body={
                <>
                    {navigationUrls().map((url, index) => (
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
                    <button className="btn btn-secondary" onClick={setEditorModeWaypointList}>
                        <i className="fas fa-chevron-left" /> Back
                    </button>
                </>
            }
        />
    )
}
