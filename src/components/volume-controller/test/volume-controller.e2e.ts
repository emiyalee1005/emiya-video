import { newE2EPage } from '@stencil/core/testing';

describe('volume-controller', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<volume-controller></volume-controller>');

    const element = await page.find('volume-controller');
    expect(element).toHaveClass('hydrated');
  });
});
