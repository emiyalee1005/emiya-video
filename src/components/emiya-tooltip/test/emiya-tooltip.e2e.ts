import { newE2EPage } from '@stencil/core/testing';

describe('emiya-tooltip', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<emiya-tooltip></emiya-tooltip>');

    const element = await page.find('emiya-tooltip');
    expect(element).toHaveClass('hydrated');
  });
});
