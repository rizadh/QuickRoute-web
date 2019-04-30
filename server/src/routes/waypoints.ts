import { IMiddleware } from 'koa-router'
import range from 'lodash/range'
import fetch from 'node-fetch'
import { URLSearchParams } from 'url'
import demoWaypoints from './resources/demoWaypoints.json'

const viewstateRegex = /<input type="hidden" name="__VIEWSTATE" value="(.*)">/
const identifierRegex = /http:\/\/pickup.atripcocourier.com\/ccwap\/\(S\((.*)\)\)\/.*.aspx/
const waypointRegex = /^([^,]+).*; (.+); (.+)<br>/
const dispatchedCountRegex = /Disptchd (\d+)/
const inprogressCountRegex = /In Prog. (\d+)/

type LoginParameters = {
    driverNumber: string;
    password: string;
}

enum OrderType {
    Dispatched = 'dispatched',
    InProgress = 'inprogress',
}

type Waypoint = {
    address: string;
    city: string;
    postalCode: string;
}

type WaypointsSet = {
    dispatched: Waypoint[];
    inprogress: Waypoint[];
}

type WaypointsResponse = {
    date: string;
    driverNumber: string;
    waypoints: WaypointsSet;
}

async function loginAndFetchWaypoints(loginParameters: LoginParameters): Promise<WaypointsSet> {
    const initialResponse = await fetch('http://pickup.atripcocourier.com/ccwap/(S())/cc.aspx')
    const loginUrl = initialResponse.url
    const loginPage = await fetch(loginUrl)

    const loginPageText = await loginPage.text()
    const loginViewstateRegexResult = viewstateRegex.exec(loginPageText)
    if (!loginViewstateRegexResult) throw new Error('Could not extract __VIEWSTATE from: ' + loginPageText)
    const loginViewstate = loginViewstateRegexResult[1]

    const mainPageResponse = await fetch(loginUrl, {
        method: 'POST',
        body: new URLSearchParams({
            __VIEWSTATE: loginViewstate,
            txtDriverNo: loginParameters.driverNumber,
            txtPassword: loginParameters.password,
            cmdLogin: 'Login',
        }),
    })
    const mainPageText = await mainPageResponse.text()

    const dispatchedCountRegexResult = dispatchedCountRegex.exec(mainPageText)
    if (!dispatchedCountRegexResult) throw new Error('Could not extract dispatched count from: ' + mainPageText)
    const dispatchedCount = parseInt(dispatchedCountRegexResult[1], 10)

    const inprogressCountRegexResult = inprogressCountRegex.exec(mainPageText)
    if (!inprogressCountRegexResult) throw new Error('Could not extract inprogress count from: ' + mainPageText)
    const inprogressCount = parseInt(inprogressCountRegexResult[1], 10)

    const identifierRegexResult = identifierRegex.exec(loginUrl)
    if (!identifierRegexResult) throw new Error('Could not parse identifier from: ' + loginUrl)
    const identifier = identifierRegexResult[1]

    const [dispatchedWaypoints, inprogressWaypoints] = await Promise.all([
        fetchWaypoints(dispatchedCount, identifier, OrderType.Dispatched),
        fetchWaypoints(inprogressCount, identifier, OrderType.InProgress),
    ])

    return { dispatched: dispatchedWaypoints, inprogress: inprogressWaypoints }
}

async function fetchWaypoints(count: number, identifier: string, orderType: OrderType): Promise<Waypoint[]> {
    const url = `http://pickup.atripcocourier.com/ccwap/(S(${identifier}))/${orderType}.aspx`

    const response = await fetch(url)
    const text = await response.text()
    const viewstateRegexResult = viewstateRegex.exec(text)
    if (!viewstateRegexResult) throw new Error('Could not extract __VIEWSTATE from: ' + text)
    const viewstate = viewstateRegexResult[1]

    const waypoints = Promise.all(
        range(0, count).map(async i => {
            const waypoint = await fetchWaypoint(i, identifier, orderType, viewstate)
            return waypoint
        }),
    )

    return waypoints
}

async function fetchWaypoint(
    index: number,
    identifier: string,
    orderType: OrderType,
    viewstate: string,
): Promise<Waypoint> {
    const url =
        `http://pickup.atripcocourier.com/ccwap/(S(${identifier}))/${orderType}.aspx` +
        `?__VIEWSTATE=${encodeURIComponent(viewstate)}&__ET=${eventTargetForOrderType(orderType)}&__EA=${index}`
    const response = await fetch(url)
    const text = await response.text()
    const waypointLine = text.split('\n')[waypointLineIndexForOrderType(orderType)]
    const waypointRegexResult = waypointRegex.exec(waypointLine)
    if (!waypointRegexResult) throw new Error('Could not extract waypoint from: ' + waypointLine)
    const [, address, city, postalCode] = waypointRegexResult

    return { address, city, postalCode }
}

function eventTargetForOrderType(orderType: OrderType): string {
    switch (orderType) {
        case OrderType.Dispatched:
            return 'lstDispatched'
        case OrderType.InProgress:
            return 'lstUnread'
    }
}

function waypointLineIndexForOrderType(orderType: OrderType): number {
    switch (orderType) {
        case OrderType.Dispatched:
            return 8
        case OrderType.InProgress:
            return 5
    }
}

const waypointsRoute: IMiddleware = async ctx => {
    try {
        const response: WaypointsResponse = {
            date: new Date().toISOString(),
            driverNumber: ctx.params.driverNumber,
            waypoints: await loginAndFetchWaypoints({
                driverNumber: ctx.params.driverNumber,
                password: ctx.params.driverNumber,
            }),
        }
        ctx.body = JSON.stringify(response)
    } catch (e) {
        ctx.status = 500
        ctx.body = e instanceof Error ? e.message : e
    }
}

const shuffle = (arr: any[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
}

export const demoWaypointsRoute: IMiddleware = async ctx => {
    await new Promise(resolve => setTimeout(resolve, ctx.params.delay))
    shuffle(demoWaypoints.waypoints)
    const response: WaypointsResponse = {
        date: new Date().toISOString(),
        driverNumber: ctx.params.driverNumber,
        waypoints: {
            dispatched: demoWaypoints.waypoints.slice(0, ctx.params.count),
            inprogress: [],
        },
    }
    ctx.body = JSON.stringify(response)
    return
}

export default waypointsRoute
