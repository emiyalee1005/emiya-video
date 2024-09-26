import { Component, Prop, h } from '@stencil/core';
import { format } from '../../utils/utils';

@Component({
  tag: 'emiya-video',
  styleUrl: 'emiya-video.css',
  shadow: true,
})
export class EmiyaVideo {
  /**
   * The first name
   */
  @Prop() sources: string[];

  /**
   * The middle name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  render() {
    return (
      <div class="relative w-full h-full ">
        <video class="w-full h-full" />
      </div>
    );
  }
}
