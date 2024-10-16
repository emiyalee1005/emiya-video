import { newE2EPage } from '@stencil/core/testing';

describe('emiya-video-progress-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<emiya-video-progress-bar></emiya-video-progress-bar>');

    const element = await page.find('emiya-video-progress-bar');
    expect(element).toHaveClass('hydrated');
  });
});
