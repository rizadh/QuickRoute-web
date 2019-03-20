import { spawnSync } from 'child_process'
import { createReadStream, readFileSync } from 'fs'
import { IMiddleware } from 'koa-router'
import { join } from 'path'
import temp from 'temp'

const pdfRoute: IMiddleware = async ctx => {
    // Get waypoints from request
    const waypoints: string[] = ctx.request.body.waypoints

    // Create tex file from template
    const template = readFileSync('latex/waypoints.tex').toString()
    const formattedWaypoints = waypoints.map(w => `\\waypoint{${w}}`).join('\n')
    const input = template.replace('__WAYPOINTS__', formattedWaypoints)

    // Compile tex file
    const tempDir = temp.mkdirSync()
    spawnSync('pdflatex', { cwd: tempDir, input })

    // Return compiled PDF output
    ctx.set('Content-Type', 'application/pdf')
    ctx.set('Content-Disposition', 'attachment; filename="route-list.pdf"')
    ctx.body = createReadStream(join(tempDir, 'texput.pdf'))
}

export default pdfRoute
