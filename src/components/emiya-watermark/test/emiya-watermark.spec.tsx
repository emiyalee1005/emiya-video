import { newSpecPage } from '@stencil/core/testing';
import { EmiyaWatermark } from '../emiya-watermark';

describe('emiya-watermark', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [EmiyaWatermark],
      html: `<emiya-watermark></emiya-watermark>`,
    });
    expect(page.root).toEqualHtml(`
      <emiya-watermark>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </emiya-watermark>
    `);
  });
});
