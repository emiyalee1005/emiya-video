import { newE2EPage } from '@stencil/core/testing';

describe('level-controller', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<level-controller></level-controller>');

    const element = await page.find('level-controller');
    expect(element).toHaveClass('hydrated');
  });
});
