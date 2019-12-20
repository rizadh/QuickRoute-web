import { DirectionsAnnotation } from '@mapbox/mapbox-sdk/services/directions'
import mapboxMatrix from '@mapbox/mapbox-sdk/services/matrix'
import { range, times } from 'lodash'
import partitionMatrix from './partitionMatrix'

if (!process.env.MAPBOX_TOKEN) throw new Error('MAPBOX_TOKEN not provided')
const matrixClient = mapboxMatrix({ accessToken: process.env.MAPBOX_TOKEN })
const MAPBOX_MAX_POINTS = 25

export type Coordinates = {
    latitude: number;
    longitude: number;
}

export enum OptimizationParameter {
    Time = 'time',
    Distance = 'distance',
}

const getCostMatrix = async (
    coordinates: Coordinates[],
    optimizationParameter: OptimizationParameter,
): Promise<number[][]> => {
    const costMatrix = times(coordinates.length, () => times(coordinates.length, () => 0))
    let annotation: DirectionsAnnotation
    switch (optimizationParameter) {
        case OptimizationParameter.Distance:
            annotation = 'distance'
            break
        case OptimizationParameter.Time:
            annotation = 'duration'
            break
        default:
            throw new Error('Optimization failed: Internal assertion failed')
    }
    const matrixRequests = partitionMatrix(MAPBOX_MAX_POINTS, coordinates).map(partition => {
        switch (partition.type) {
            case 'SYMMETRIC':
                return matrixClient
                    .getMatrix({
                        points: partition.items.map(({ longitude, latitude }) => ({
                            coordinates: [longitude, latitude],
                        })),
                        annotations: ([annotation] as unknown) as DirectionsAnnotation,
                    })
                    .send()
                    .then(response => {
                        switch (optimizationParameter) {
                            case OptimizationParameter.Distance:
                                return response.body.distances as number[][]
                            case OptimizationParameter.Time:
                                return response.body.durations as number[][]
                            default:
                                throw new Error('Optimization failed: No distance matrix received')
                        }
                    })
                    .then(matrix => {
                        const { items, offset } = partition
                        for (let i = 0; i < items.length; i++) {
                            costMatrix[offset + i].splice(offset, items.length, ...matrix[i])
                        }
                    })
            case 'ASYMMETRIC':
                return matrixClient
                    .getMatrix({
                        points: partition.rowItems.concat(partition.columnItems).map(({ longitude, latitude }) => ({
                            coordinates: [longitude, latitude],
                        })),
                        annotations: ([annotation] as unknown) as DirectionsAnnotation,
                        sources: range(0, partition.rowItems.length),
                        destinations: range(
                            partition.rowItems.length,
                            partition.rowItems.length + partition.columnItems.length,
                        ),
                    })
                    .send()
                    .then(response => {
                        switch (optimizationParameter) {
                            case OptimizationParameter.Distance:
                                return response.body.distances as number[][]
                            case OptimizationParameter.Time:
                                return response.body.durations as number[][]
                            default:
                                throw new Error('Optimization failed: No distance matrix received')
                        }
                    })
                    .then(matrix => {
                        const { rowItems, columnItems, rowOffset, columnOffset } = partition
                        for (let i = 0; i < rowItems.length; i++) {
                            costMatrix[rowOffset + i].splice(columnOffset, columnItems.length, ...matrix[i])
                        }
                    })
            default:
                throw new Error('Optimization failed: Internal assertion failed')
        }
    })

    await Promise.all(matrixRequests)
    return costMatrix
}

export default getCostMatrix
