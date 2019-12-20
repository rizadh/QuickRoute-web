import { IMiddleware } from 'koa-router'
import { solveTsp } from 'node-tspsolver'
import getCostMatrix, { Coordinates, OptimizationParameter } from './util/getCostMatrix'

type OptimizeRouteRequest = {
    coordinates: Coordinates[];
    optimizationParameter: OptimizationParameter;
}

const optimizeRoute: IMiddleware = async ctx => {
    const { coordinates, optimizationParameter } = ctx.request.body as OptimizeRouteRequest

    if (!coordinates) {
        ctx.status = 400
        ctx.body = { error: 'Coordinates were not provided' }
        return
    }

    if (!optimizationParameter) {
        ctx.status = 400
        ctx.body = { error: 'Optimization parameter was not provided' }
        return
    }

    const costMatrix = await getCostMatrix(coordinates, optimizationParameter)
    const result = await solveTsp(costMatrix, false)
    ctx.body = { result }
}

export default optimizeRoute
