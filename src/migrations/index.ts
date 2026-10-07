import * as migration_20261007_120206_init from './20261007_120206_init';
import * as migration_20261007_130456_pass1_autosave_published_at from './20261007_130456_pass1_autosave_published_at';

export const migrations = [
  {
    up: migration_20261007_120206_init.up,
    down: migration_20261007_120206_init.down,
    name: '20261007_120206_init',
  },
  {
    up: migration_20261007_130456_pass1_autosave_published_at.up,
    down: migration_20261007_130456_pass1_autosave_published_at.down,
    name: '20261007_130456_pass1_autosave_published_at'
  },
];
