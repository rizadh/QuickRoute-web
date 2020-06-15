import { hot } from 'react-hot-loader';

import React from 'react';
import { ProgressBar } from '../components/ProgressBar';
import { Editor } from './editor/Editor';
import { ErrorDialog } from './ErrorDialog';
import { MapContainer } from './map/MapContainer';

export const App = hot(module)(() => (
    <>
        <MapContainer />
        <Editor />
        <ProgressBar />
        <ErrorDialog />
    </>
));
