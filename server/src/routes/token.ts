import { sign } from 'jsonwebtoken'
import { IMiddleware } from 'koa-router'

if (!process.env.MAPKIT_KEY) throw new Error('MAPKIT_KEY not provided')
if (!process.env.MAPKIT_TEAM_ID) throw new Error('MAPKIT_TEAM_ID not provided')
if (!process.env.MAPKIT_KEY_ID) throw new Error('MAPKIT_KEY_ID not provided')
const { MAPKIT_KEY, MAPKIT_TEAM_ID, MAPKIT_KEY_ID } = process.env

const tokensRoute: IMiddleware = ctx => {
    const key = `-----BEGIN PRIVATE KEY-----\n${MAPKIT_KEY}\n-----END PRIVATE KEY-----`
    const payload = {
        iss: MAPKIT_TEAM_ID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000 + 3600),
    }
    const options = {
        algorithm: 'ES256',
        keyid: MAPKIT_KEY_ID,
    }
    const token = sign(payload, key, options)

    ctx.body = token
}

export default tokensRoute
