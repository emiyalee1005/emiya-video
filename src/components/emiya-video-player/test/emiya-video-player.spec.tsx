import { newSpecPage } from '@stencil/core/testing';
import { EmiyaVideoPlayer } from '../emiya-video-player';

describe('emiya-video-player', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [EmiyaVideoPlayer],
      html: `<emiya-video-player></emiya-video-player>`,
    });
    expect(page.root).toEqualHtml(`
      <emiya-video-player>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </emiya-video-player>
    `);
  });
});
