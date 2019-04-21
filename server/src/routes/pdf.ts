import { spawnSync } from 'child_process'
import lescape from 'escape-latex'
import { createReadStream, readFileSync } from 'fs'
import { IMiddleware } from 'koa-router'
import { join } from 'path'
import temp from 'temp'

const pdfRoute: IMiddleware = async ctx => {
    // Get waypoints from request
    const waypoints: string[] | undefined = ctx.request.body.waypoints

    if (waypoints) {
        // Create tex file from template
        const template = readFileSync('latex/waypoints.tex').toString()
        const formattedWaypoints = waypoints.map(w => `\\waypoint{${lescape(w)}}`).join('\n')
        const input = template.replace('__WAYPOINTS__', formattedWaypoints)

        // Compile tex file
        const tempDir = temp.mkdirSync()
        spawnSync('pdflatex', { cwd: tempDir, input })

        // Return compiled PDF output
        ctx.set('Content-Type', 'application/pdf')
        ctx.set('Content-Disposition', 'attachment; filename="route-list.pdf"')
        ctx.body = createReadStream(join(tempDir, 'texput.pdf'))
    } else {
        ctx.status = 400
        ctx.body = 'Waypoints were not provided'
    }
}

export default pdfRoute
