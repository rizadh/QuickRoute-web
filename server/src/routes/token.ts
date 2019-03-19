import { readFileSync } from 'fs'
import { sign } from 'jsonwebtoken'
import { IMiddleware } from 'koa-router'

const MAPKIT_KEY_FILE = process.env.ROUTE_PLANNER_MAPKIT_KEY_FILE || 'private/mapkit_key.txt'

const tokensRoute: IMiddleware = ctx => {
    const mapkitKeyFile = MAPKIT_KEY_FILE
    if (!mapkitKeyFile) {
        ctx.status = 500
        return
    }

    const key = readFileSync(mapkitKeyFile)
    const payload = {
        iss: 'UZW69BGU4W',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000 + 3600),
    }
    const options = {
        algorithm: 'ES256',
        keyid: '5K2A728XAW',
    }
    const token = sign(payload, key, options)

    ctx.body = token
}

export default tokensRoute
