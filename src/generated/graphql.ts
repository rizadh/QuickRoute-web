export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Upload: any,
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Coordinates = {
  latitude: Scalars['Float'],
  longitude: Scalars['Float'],
};

export type ImportedWaypoints = {
   __typename?: 'ImportedWaypoints',
  dispatched: Array<Waypoint>,
  inprogress: Array<Waypoint>,
};

export enum OptimizationParameter {
  Time = 'TIME',
  Distance = 'DISTANCE'
}

export type Query = {
   __typename?: 'Query',
  token: Scalars['String'],
  waypoints: ImportedWaypoints,
  demoWaypoints: ImportedWaypoints,
  pdf: Scalars['String'],
  optimize: Array<Scalars['Float']>,
};


export type QueryWaypointsArgs = {
  driverNumber: Scalars['String'],
  password?: Maybe<Scalars['String']>
};


export type QueryDemoWaypointsArgs = {
  count: Scalars['Int'],
  delay?: Maybe<Scalars['Int']>
};


export type QueryPdfArgs = {
  waypoints: Array<Scalars['String']>
};


export type QueryOptimizeArgs = {
  coordinates: Array<Coordinates>,
  optimizationParameter: OptimizationParameter
};


export type Waypoint = {
   __typename?: 'Waypoint',
  address: Scalars['String'],
  city: Scalars['String'],
  postalCode: Scalars['String'],
};

export type GetTokenQueryVariables = {};


export type GetTokenQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'token'>
);

export type ImportWaypointsQueryVariables = {
  driverNumber: Scalars['String'],
  password?: Maybe<Scalars['String']>
};


export type ImportWaypointsQuery = (
  { __typename?: 'Query' }
  & { waypoints: (
    { __typename?: 'ImportedWaypoints' }
    & { dispatched: Array<(
      { __typename?: 'Waypoint' }
      & Pick<Waypoint, 'address' | 'city' | 'postalCode'>
    )>, inprogress: Array<(
      { __typename?: 'Waypoint' }
      & Pick<Waypoint, 'address' | 'city' | 'postalCode'>
    )> }
  ) }
);

export type OptimizeQueryVariables = {
  coordinates: Array<Coordinates>,
  optimizationParameter: OptimizationParameter
};


export type OptimizeQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'optimize'>
);

export type GeneratePdfQueryVariables = {
  waypoints: Array<Scalars['String']>
};


export type GeneratePdfQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'pdf'>
);
