import { newSpecPage } from '@stencil/core/testing';
import { EmiyaVideoProgressBar } from '../emiya-video-progress-bar';

describe('emiya-video-progress-bar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [EmiyaVideoProgressBar],
      html: `<emiya-video-progress-bar></emiya-video-progress-bar>`,
    });
    expect(page.root).toEqualHtml(`
      <emiya-video-progress-bar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </emiya-video-progress-bar>
    `);
  });
});
