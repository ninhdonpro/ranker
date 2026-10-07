import * as migration_20261007_120206_init from './20261007_120206_init';

export const migrations = [
  {
    up: migration_20261007_120206_init.up,
    down: migration_20261007_120206_init.down,
    name: '20261007_120206_init'
  },
];
