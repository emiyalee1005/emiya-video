import { newSpecPage } from '@stencil/core/testing';
import { EmiyaTooltip } from '../emiya-tooltip';

describe('emiya-tooltip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [EmiyaTooltip],
      html: `<emiya-tooltip></emiya-tooltip>`,
    });
    expect(page.root).toEqualHtml(`
      <emiya-tooltip>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </emiya-tooltip>
    `);
  });
});
