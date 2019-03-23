import { IMiddleware } from 'koa-router'
import { solveTsp } from 'node-tspsolver'

const optimizeRoute: IMiddleware = async ctx => {
    // Get cost matrix from request
    const costMatrix: number[][] | undefined = ctx.request.body.costMatrix

    if (costMatrix) {
        ctx.body = { result: await solveTsp(costMatrix, false) }
    } else {
        ctx.status = 400
        ctx.body = 'Cost matrix was not provided'
    }
}

export default optimizeRoute
