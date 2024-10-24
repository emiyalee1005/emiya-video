import { newE2EPage } from '@stencil/core/testing';

describe('playback-rate-controller', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<playback-rate-controller></playback-rate-controller>');

    const element = await page.find('playback-rate-controller');
    expect(element).toHaveClass('hydrated');
  });
});
