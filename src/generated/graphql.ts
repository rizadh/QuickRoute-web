export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type AtripcoOrders = {
  __typename?: 'AtripcoOrders';
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
  importedWaypoints: AtripcoOrders;
  atripcoOrders: AtripcoOrders;
  optimizedRoute: Array<Scalars['Float']>;
};


export type QueryMapkitTokenArgs = {
  origin?: Maybe<Scalars['String']>;
};


export type QueryImportedWaypointsArgs = {
  driverNumber: Scalars['String'];
  password: Scalars['String'];
};


export type QueryAtripcoOrdersArgs = {
  driverNumber: Scalars['String'];
  password: Scalars['String'];
};


export type QueryOptimizedRouteArgs = {
  coordinates: Array<Coordinates>;
  optimizationParameter: OptimizationParameter;
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
  & { atripcoOrders: (
    { __typename?: 'AtripcoOrders' }
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
  coordinates: Array<Coordinates> | Coordinates;
  optimizationParameter: OptimizationParameter;
}>;


export type OptimizeQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'optimizedRoute'>
);
