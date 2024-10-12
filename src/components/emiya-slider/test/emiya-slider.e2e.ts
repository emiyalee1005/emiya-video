import { newE2EPage } from '@stencil/core/testing';

describe('emiya-slider', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<emiya-slider></emiya-slider>');

    const element = await page.find('emiya-slider');
    expect(element).toHaveClass('hydrated');
  });
});
