import { Component, h, Prop, State, Watch } from '@stencil/core';
import spinnerImg from './assets/spinner.svg';

@Component({
  tag: 'emiya-video',
  styleUrl: 'emiya-video.scss',
  scoped: true,
})
export class EmiyaVideo {
  @Prop() src?: string;

  @State() isFullScreen: boolean = false;
  @State() status: 'loading' | 'ready' | 'waiting' | 'playing' | 'paused' | 'ended' | 'error' = 'ready';
  @State() isMouseHover: boolean = false;
  @State() isRecentlyClicked: boolean = false;

  removeRecentlyClickedStatusTimer: any;

  @Watch('src')
  onSrcChange(newValue: string) {
    this.status = newValue ? 'loading' : 'ready';
  }

  componentWillLoad() {
    this.onSrcChange(this.src);
    // setInterval(() => {
    //   this.isFullScreen = !this.isFullScreen;
    // }, 3000);
  }

  onVideoLoadedData() {
    this.status = 'ready';
  }

  onVideoPlaying() {
    this.status = 'playing';
  }

  onVideoWaiting() {
    this.status = 'waiting';
  }

  onMouseEnter() {
    this.isMouseHover = true;
  }

  onMouseLeave() {
    this.isMouseHover = false;
  }

  onClick() {
    this.isRecentlyClicked = true;
    clearTimeout(this.removeRecentlyClickedStatusTimer);
    this.removeRecentlyClickedStatusTimer = setTimeout(() => {
      this.isRecentlyClicked = false;
      this.removeRecentlyClickedStatusTimer = undefined;
    }, 3000);
  }

  render() {
    return (
      <emiya-teleport targetSelector={this.isFullScreen ? 'body' : undefined}>
        <div
          class={`${this.isFullScreen ? 'fixed top-0 left-0' : 'relative'} bg-white w-full h-full`}
          onMouseEnter={() => this.onMouseEnter()}
          onMouseLeave={() => this.onMouseLeave()}
          onClick={() => this.onClick()}
        >
          <video
            key={this.src}
            src={this.src}
            autoplay={true}
            class="w-full h-full"
            controls={false}
            onWaiting={() => this.onVideoWaiting()}
            onPlaying={() => this.onVideoPlaying()}
            onLoadedData={() => this.onVideoLoadedData()}
          />
          {(this.status === 'loading' || this.status === 'waiting') && (
            <div class="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
              <img src={spinnerImg} alt="加载中.." />
            </div>
          )}
          {(1 || this.isRecentlyClicked || this.isMouseHover) && (
            <div class="absolute left-0 top-0 w-full h-full">
              <div class="w-full control-bar absolute bottom-0 left-0 h-[66px]">EMIYA</div>
            </div>
          )}
        </div>
      </emiya-teleport>
    );
  }
}
