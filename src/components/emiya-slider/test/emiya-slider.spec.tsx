import { newSpecPage } from '@stencil/core/testing';
import { EmiyaSlider } from '../emiya-slider';

describe('emiya-slider', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [EmiyaSlider],
      html: `<emiya-slider></emiya-slider>`,
    });
    expect(page.root).toEqualHtml(`
      <emiya-slider>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </emiya-slider>
    `);
  });
});
