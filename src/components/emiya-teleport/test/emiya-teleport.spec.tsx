import { newSpecPage } from '@stencil/core/testing';
import { EmiyaTeleport } from '../emiya-teleport';

describe('emiya-teleport', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [EmiyaTeleport],
      html: `<emiya-teleport></emiya-teleport>`,
    });
    expect(page.root).toEqualHtml(`
      <emiya-teleport>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </emiya-teleport>
    `);
  });
});
