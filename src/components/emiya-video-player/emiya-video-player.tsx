import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'emiya-video-player',
  styleUrl: 'emiya-video-player.scss',
  scoped: true,
})
export class EmiyaVideoPlayer {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
