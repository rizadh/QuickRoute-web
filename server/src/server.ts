import Koa from 'koa'
import Parser from 'koa-bodyparser'
import Logger from 'koa-logger'
import Router from 'koa-router'
import Static from 'koa-static'
import pdfRoute from './routes/pdf'
import tokenRoute from './routes/token'
import waypointsRoute from './routes/waypoints'

const LISTEN_PORT = process.env.ROUTE_PLANNER_LISTEN_PORT || 8000
const WEB_ROOT = process.env.ROUTE_PLANNER_WEB_ROOT || 'client/public'

const app = new Koa()
const router = new Router()

router.get('/token', tokenRoute)
router.get('/waypoints/:id', waypointsRoute)
router.post('/pdf', pdfRoute)

app.use(Logger())
app.use(Static(WEB_ROOT))
app.use(Parser())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(LISTEN_PORT)

process.stderr.write(`Listening on http://localhost:${LISTEN_PORT}...\n`)
