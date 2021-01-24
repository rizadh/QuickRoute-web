export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Waypoint = {
  __typename?: 'Waypoint';
  address: Scalars['String'];
  city: Scalars['String'];
  postalCode: Scalars['String'];
};

export type ImportedWaypoints = {
  __typename?: 'ImportedWaypoints';
  dispatched: Array<Waypoint>;
  inprogress: Array<Waypoint>;
};

export type Coordinates = {
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
};

export enum OptimizationParameter {
  Time = 'TIME',
  Distance = 'DISTANCE'
}

export type Query = {
  __typename?: 'Query';
  mapkitToken: Scalars['String'];
  importedWaypoints: ImportedWaypoints;
  pdf: Scalars['String'];
  optimizedRoute: Array<Scalars['Float']>;
  tsp: Array<Scalars['Int']>;
};


export type QueryMapkitTokenArgs = {
  origin?: Maybe<Scalars['String']>;
};


export type QueryImportedWaypointsArgs = {
  driverNumber: Scalars['String'];
  password: Scalars['String'];
};


export type QueryPdfArgs = {
  waypoints: Array<Scalars['String']>;
};


export type QueryOptimizedRouteArgs = {
  coordinates: Array<Coordinates>;
  optimizationParameter: OptimizationParameter;
};


export type QueryTspArgs = {
  costMatrix: Array<Array<Scalars['Float']>>;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}


export type GetTokenQueryVariables = Exact<{
  origin?: Maybe<Scalars['String']>;
}>;


export type GetTokenQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'mapkitToken'>
);

export type ImportWaypointsQueryVariables = Exact<{
  driverNumber: Scalars['String'];
  password: Scalars['String'];
}>;


export type ImportWaypointsQuery = (
  { __typename?: 'Query' }
  & { importedWaypoints: (
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

export type OptimizeQueryVariables = Exact<{
  coordinates: Array<Coordinates>;
  optimizationParameter: OptimizationParameter;
}>;


export type OptimizeQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'optimizedRoute'>
);

export type GeneratePdfQueryVariables = Exact<{
  waypoints: Array<Scalars['String']>;
}>;


export type GeneratePdfQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'pdf'>
);

export type SolveTspQueryVariables = Exact<{
  costMatrix: Array<Array<Scalars['Float']>>;
}>;


export type SolveTspQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'tsp'>
);
