import { gql } from 'apollo-boost'

export const GetToken = gql`
    query GetToken {
        token
    }
`

export const ImportWaypoints = gql`
    query ImportWaypoints($driverNumber: String!, $password: String) {
        waypoints(driverNumber: $driverNumber, password: $password) {
            dispatched {
                address
                city
                postalCode
            }
            inprogress {
                address
                city
                postalCode
            }
        }
    }
`

export const Optimize = gql`
    query Optimize($coordinates: [Coordinates!]!, $optimizationParameter: OptimizationParameter!) {
        optimize(coordinates: $coordinates, optimizationParameter: $optimizationParameter)
    }
`

export const GeneratePDF = gql`
    query GeneratePDF($waypoints: [String!]!) {
        pdf(waypoints: $waypoints)
    }
`
