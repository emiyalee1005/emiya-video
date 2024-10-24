import { newSpecPage } from '@stencil/core/testing';
import { PlaybackRateController } from '../playback-rate-controller';

describe('playback-rate-controller', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PlaybackRateController],
      html: `<playback-rate-controller></playback-rate-controller>`,
    });
    expect(page.root).toEqualHtml(`
      <playback-rate-controller>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </playback-rate-controller>
    `);
  });
});
