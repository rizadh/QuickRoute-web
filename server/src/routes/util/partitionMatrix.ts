import { range } from 'lodash'

type Partition<T> = SymmetricPartition<T> | AsymmetricPartition<T>

type SymmetricPartition<T> = {
    type: 'SYMMETRIC';
    offset: number;
    items: T[];
}

type AsymmetricPartition<T> = {
    type: 'ASYMMETRIC';
    rowOffset: number;
    columnOffset: number;
    rowItems: T[];
    columnItems: T[];
}

const partitionMatrix = <T>(n: number, items: T[], offset: number = 0): Array<Partition<T>> => {
    const minorStepStride = Math.floor(n / 2)
    const majorStepStride = Math.ceil(n / 2)

    const symmetricPartition: SymmetricPartition<T> = {
        type: 'SYMMETRIC',
        offset,
        items: items.slice(offset, offset + n),
    }

    if (items.length > n + offset) {
        const remainingLength = items.length - n - offset
        const minorStepCount = Math.ceil(remainingLength / minorStepStride)
        const majorStepCount = Math.ceil(remainingLength / majorStepStride)

        const majorRowPartitions: Array<AsymmetricPartition<T>> = range(minorStepCount).map(i => ({
            type: 'ASYMMETRIC',
            rowOffset: offset,
            columnOffset: offset + n + i * minorStepStride,
            rowItems: items.slice(offset, offset + majorStepStride),
            columnItems: items.slice(offset + n + i * minorStepStride, offset + n + (i + 1) * minorStepStride),
        }))

        const minorRowPartitions: Array<AsymmetricPartition<T>> = range(majorStepCount).map(i => ({
            type: 'ASYMMETRIC',
            rowOffset: offset + majorStepStride,
            columnOffset: offset + n + i * majorStepStride,
            rowItems: items.slice(offset + majorStepStride, offset + n),
            columnItems: items.slice(offset + n + i * majorStepStride, offset + n + (i + 1) * majorStepStride),
        }))

        const majorColumnPartitions: Array<AsymmetricPartition<T>> = range(minorStepCount).map(i => ({
            type: 'ASYMMETRIC',
            rowOffset: offset + n + i * minorStepStride,
            columnOffset: offset,
            rowItems: items.slice(offset + n + i * minorStepStride, offset + n + (i + 1) * minorStepStride),
            columnItems: items.slice(offset, offset + majorStepStride),
        }))

        const minorColumnPartitions: Array<AsymmetricPartition<T>> = range(majorStepCount).map(i => ({
            type: 'ASYMMETRIC',
            rowOffset: offset + n + i * majorStepStride,
            columnOffset: offset + majorStepStride,
            rowItems: items.slice(offset + n + i * majorStepStride, offset + n + (i + 1) * majorStepStride),
            columnItems: items.slice(offset + majorStepStride, offset + n),
        }))

        return [
            symmetricPartition,
            ...majorRowPartitions,
            ...minorRowPartitions,
            ...majorColumnPartitions,
            ...minorColumnPartitions,
            ...partitionMatrix(n, items, offset + n),
        ]
    } else {
        return [symmetricPartition]
    }
}

export default partitionMatrix
