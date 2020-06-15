import { gql } from 'apollo-boost';

export const GetToken = gql`
    query GetToken($origin: String) {
        mapkitToken(origin: $origin)
    }
`;

export const ImportWaypoints = gql`
    query ImportWaypoints($driverNumber: String!, $password: String!) {
        importedWaypoints(driverNumber: $driverNumber, password: $password) {
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
`;

export const Optimize = gql`
    query Optimize($coordinates: [Coordinates!]!, $optimizationParameter: OptimizationParameter!) {
        optimizedRoute(coordinates: $coordinates, optimizationParameter: $optimizationParameter)
    }
`;

export const GeneratePDF = gql`
    query GeneratePDF($waypoints: [String!]!) {
        pdf(waypoints: $waypoints)
    }
`;

export const SolveTSP = gql`
    query SolveTSP($costMatrix: [[Float!]!]!) {
        tsp(costMatrix: $costMatrix)
    }
`;
