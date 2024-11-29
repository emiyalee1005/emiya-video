import { newE2EPage } from '@stencil/core/testing';

describe('emiya-video-player', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<emiya-video-player></emiya-video-player>');

    const element = await page.find('emiya-video-player');
    expect(element).toHaveClass('hydrated');
  });
});
