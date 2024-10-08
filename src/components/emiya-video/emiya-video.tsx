import { Component, Prop, h, Watch } from '@stencil/core';
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
  @Prop() sources: string;

  /**
   * The middle name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

  parsedSources: string[];

  @Watch('sources')
  sourcesDidChangeHandler(newValue: string) {
    this.parsedSources = JSON.parse(newValue);
  }

  private getText(): string {
    return format('EMIYA', this.middle, this.last);
  }

  componentWillLoad() {
    this.sourcesDidChangeHandler(this.sources);
    console.log('Component loaded', this.sources, this.parsedSources);
  }

  render() {
    return (
      <div class="relative w-full h-full ">
        <video class="w-full h-full" />
      </div>
    );
  }
}
