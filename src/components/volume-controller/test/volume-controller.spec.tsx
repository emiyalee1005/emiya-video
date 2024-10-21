import { newSpecPage } from '@stencil/core/testing';
import { VolumeController } from '../volume-controller';

describe('volume-controller', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [VolumeController],
      html: `<volume-controller></volume-controller>`,
    });
    expect(page.root).toEqualHtml(`
      <volume-controller>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </volume-controller>
    `);
  });
});
