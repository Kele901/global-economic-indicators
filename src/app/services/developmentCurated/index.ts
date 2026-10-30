import type { QualityFlag } from './types';

export * from './types';
export * from './hdrData';
export * from './snapshotData';
export * from './indices';
export * from './incomeGroups';
export * from './stories';
export * from './helpers';

// Date the curated snapshot (HDR, indices, PIP, projections) was last refreshed.
export const DEV_CURATED_LAST_UPDATED = '2026-10-30';

// Generated files are copied from publisher APIs/CSVs; hand-entered tables are estimates.
export const DEV_QUALITY: Record<string, QualityFlag> = {
  hdr: 'curated',
  incomeDistribution: 'curated',
  projections: 'curated',
  incomeGroups: 'curated',
  hci: 'curated',
  socialProgress: 'estimate',
  happiness: 'estimate',
  mobility: 'estimate',
  subnational: 'estimate',
  mpi: 'estimate',
  stories: 'curated',
};
