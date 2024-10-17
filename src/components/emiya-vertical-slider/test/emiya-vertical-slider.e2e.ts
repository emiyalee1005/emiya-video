import { newE2EPage } from '@stencil/core/testing';

describe('emiya-vertical-slider', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<emiya-vertical-slider></emiya-vertical-slider>');

    const element = await page.find('emiya-vertical-slider');
    expect(element).toHaveClass('hydrated');
  });
});
