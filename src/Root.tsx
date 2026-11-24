import React from 'react';
import {Composition} from 'remotion';
import {OctoScene} from './Octo';

export const Root: React.FC = () => (
  <Composition id="Mascot" component={OctoScene} durationInFrames={150} fps={30} width={1080} height={1920} />
);
