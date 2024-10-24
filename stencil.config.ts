import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import tailwind, { tailwindHMR } from 'stencil-tailwind-plugin';

export const config: Config = {
  devServer: {
    address: '0.0.0.0',
  },
  namespace: 'emiya-video',
  plugins: [tailwind(), tailwindHMR(), sass()],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: 'new',
  },
};
