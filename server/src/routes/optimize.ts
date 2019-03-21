import { IMiddleware } from 'koa-router'
import { solveTsp } from 'node-tspsolver'

const optimizeRoute: IMiddleware = async ctx => {
    // Get cost matrix from request
    const costMatrix: number[][] = ctx.request.body.costMatrix

    ctx.body = { result: await solveTsp(costMatrix, false) }
}

export default optimizeRoute
