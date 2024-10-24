import { newE2EPage } from '@stencil/core/testing';

describe('emiya-watermark', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<emiya-watermark></emiya-watermark>');

    const element = await page.find('emiya-watermark');
    expect(element).toHaveClass('hydrated');
  });
});
