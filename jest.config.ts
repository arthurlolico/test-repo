import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  preset: '@shelf/jest-dynamodb'
};
export default config;