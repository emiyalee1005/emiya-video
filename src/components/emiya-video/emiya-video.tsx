import { Component, h, Prop, State, Watch } from '@stencil/core';
import Hls, { Level } from 'hls.js';
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
  @State() levels: { id: number; name: string; level: Level }[] = [];
  @State() currentLevel: number;
  @State() volume: number = 80;

  hls: Hls;
  videoRef: HTMLVideoElement;
  removeRecentlyClickedStatusTimer: any;

  @Watch('src')
  onSrcChange(newValue: string) {
    this.status = newValue ? 'loading' : 'ready';
    this.levels = [];
    this.currentLevel = undefined;
    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
    if (this.videoRef) {
      this.videoRef?.pause();
      this.videoRef.src = '';
      this.videoRef.load();
    }

    if (newValue) {
      if (Hls.isSupported()) {
        this.hls = new Hls();
        this.hls.loadSource(newValue);
        this.hls.attachMedia(this.videoRef);

        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.levels = this.hls.levels.map(function (level) {
            return {
              level,
              id: level.height,
              name: level.height + 'p',
            };
          });
          console.log('可用分辨率: ', this.levels);
        });

        this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log(event, data);
          this.currentLevel = this.levels[data.level]?.id;
          console.log('当前分辨率: ', this.currentLevel);
        });
      } else if (this.videoRef.canPlayType('application/vnd.apple.mpegurl')) {
        alert('浏览器版本过低，请升级');
        //this.videoRef.src = newValue;
      } else {
        alert('浏览器版本过旧，请升级');
      }
    }
  }

  componentDidLoad() {
    this.onSrcChange(this.src);
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
            ref={a => (this.videoRef = a)}
            key={this.src}
            // src={this.src}
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
              <div class="w-full control-bar absolute bottom-0 left-0 h-[66px]">
                EMIYA
                <emiya-vertical-slider style={{ height: '180px' }} value={this.volume} onChange={a => (this.volume = a)}></emiya-vertical-slider>
                <emiya-video-progress-bar key={this.src} videoRef={this.videoRef} />
              </div>
            </div>
          )}
        </div>
      </emiya-teleport>
    );
  }
}
