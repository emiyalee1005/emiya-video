import { newSpecPage } from '@stencil/core/testing';
import { LevelController } from '../level-controller';

describe('level-controller', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [LevelController],
      html: `<level-controller></level-controller>`,
    });
    expect(page.root).toEqualHtml(`
      <level-controller>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </level-controller>
    `);
  });
});
