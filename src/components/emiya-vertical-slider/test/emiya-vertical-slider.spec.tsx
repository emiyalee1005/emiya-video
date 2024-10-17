import { newSpecPage } from '@stencil/core/testing';
import { EmiyaVerticalSlider } from '../emiya-vertical-slider';

describe('emiya-vertical-slider', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [EmiyaVerticalSlider],
      html: `<emiya-vertical-slider></emiya-vertical-slider>`,
    });
    expect(page.root).toEqualHtml(`
      <emiya-vertical-slider>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </emiya-vertical-slider>
    `);
  });
});
