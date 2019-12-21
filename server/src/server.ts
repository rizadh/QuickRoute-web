import cors from '@koa/cors'
import Koa from 'koa'
import Parser from 'koa-bodyparser'
import Logger from 'koa-logger'
import Router from 'koa-router'
import optimizeRoute from './routes/optimize'
import pdfRoute from './routes/pdf'
import tokenRoute from './routes/token'
import waypointsRoute, { demoWaypointsRoute } from './routes/waypoints'

const router = new Router()
router.get('/token', tokenRoute)
router.get('/waypoints/demo/:count/:delay', demoWaypointsRoute)
router.get('/waypoints/:driverNumber', waypointsRoute)
router.post('/pdf', pdfRoute)
router.post('/optimize', optimizeRoute)

const app = new Koa()
app.use(cors())
app.use(Logger())
app.use(Parser())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(process.env.PORT)

process.stderr.write(`Listening on port ${process.env.PORT}...\n`)
