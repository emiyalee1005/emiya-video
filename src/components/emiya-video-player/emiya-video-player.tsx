import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'emiya-video-player',
  styleUrl: 'emiya-video-player.scss',
  shadow: true,
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
