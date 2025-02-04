import { ExperimentDraft } from '@avocet/core';

export const experiment1 = ExperimentDraft.template({
  name: 'example experiment to embed',
  environmentName: 'production',
});

export const switchbackExperiment1 = ExperimentDraft.templateSwitchback({
  name: 'my switchback',
  environmentName: 'production',
});

export const abExperiment1 = ExperimentDraft.templateAB({
  name: 'two group test',
  environmentName: 'production',
});

export const exampleExperiments: ExperimentDraft[] = [
  experiment1,
  switchbackExperiment1,
  abExperiment1,
].map((el) => Object.freeze(el));
