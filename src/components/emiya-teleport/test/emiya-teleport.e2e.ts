import { newE2EPage } from '@stencil/core/testing';

describe('emiya-teleport', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<emiya-teleport></emiya-teleport>');

    const element = await page.find('emiya-teleport');
    expect(element).toHaveClass('hydrated');
  });
});
