import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import Hls, { Level } from 'hls.js';
import pauseIcon from './assets/pause.svg';
import pauseIcon1 from './assets/pause1.svg';
import playIcon from './assets/play.svg';
import playIcon1 from './assets/play1.svg';
import spinnerImg from './assets/spinner.svg';

@Component({
  tag: 'emiya-video',
  styleUrl: 'emiya-video.scss',
  scoped: true,
})
export class EmiyaVideo {
  @Prop() src?: string;

  @State() hoveringTarget: 'center-play' | 'play' | null = null;
  @State() isFullScreen: boolean = false;
  @State() status: 'idle' | 'loading' | 'loaded' | 'canPlay' | 'waiting' | 'play' | 'playing' | 'paused' | 'ended' | 'error' = 'loaded';
  @State() isMouseHover: boolean = false;
  @State() isRecentlyClicked: boolean = false;
  @State() levels: { id: number; name: string; level: Level }[] = [];
  @State() currentLevel: number;

  hls: Hls;
  videoRef: HTMLVideoElement;
  removeRecentlyClickedStatusTimer: any;

  @Watch('src')
  onSrcChange(newValue: string) {
    this.status = newValue ? 'loading' : 'idle';
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

  get shouldShowLoading() {
    return this.status === 'loading' || this.status === 'waiting';
  }

  get shouldShowCenterPlay() {
    return this.status === 'paused' || this.status === 'loaded' || this.status === 'canPlay' || this.status === 'ended';
  }

  get shouldShowControl() {
    return this.isRecentlyClicked || this.isMouseHover;
  }

  get isPlaying() {
    return this.status === 'playing' || this.status === 'play' || this.status === 'waiting';
  }

  componentDidLoad() {
    this.onSrcChange(this.src);
  }

  componentWillUnload() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
    if (this.videoRef) {
      this.videoRef?.pause();
      this.videoRef.src = '';
      this.videoRef.load();
    }
  }

  onVideoLoadedData() {
    this.status = 'loaded';
  }

  onVideoError() {
    this.status = 'error';
  }

  onVideoCanPlay() {
    this.status = 'canPlay';
  }

  onVideoPlay() {
    this.status = 'play';
  }

  onVideoPlaying() {
    this.status = 'playing';
  }

  onVideoWaiting() {
    this.status = 'waiting';
  }

  onVideoPaused() {
    this.status = 'paused';
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
      <Host>
        <emiya-teleport targetSelector={this.isFullScreen ? 'body' : undefined}>
          <div
            class={`${this.isFullScreen ? 'fixed top-0 left-0' : 'relative'} bg-black text-white w-full h-full`}
            onPointerEnter={() => this.onMouseEnter()}
            onPointerLeave={() => this.onMouseLeave()}
            onPointerCancel={() => this.onMouseLeave()}
            onClick={() => this.onClick()}
          >
            <video
              ref={a => (this.videoRef = a)}
              key={this.src}
              // src={this.src}
              autoplay={false}
              class="w-full h-full pointer-events-none"
              controls={false}
              onError={() => this.onVideoError()}
              onCanPlay={() => this.onVideoCanPlay()}
              onWaiting={() => this.onVideoWaiting()}
              onPlaying={() => this.onVideoPlaying()}
              onPause={() => this.onVideoPaused()}
              onPlay={() => this.onVideoPlay()}
              onLoadedData={() => this.onVideoLoadedData()}
            />
            <div class="absolute left-0 bottom-0 w-full h-full cursor-pointer" onClick={() => (this.videoRef.paused ? this.videoRef.play() : this.videoRef.pause())}></div>
            {this.shouldShowCenterPlay && (
              <div class="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
                <div
                  class="pointer-events-auto flex items-center justify-center cursor-pointer"
                  onPointerEnter={() => (this.hoveringTarget = 'center-play')}
                  onPointerLeave={() => (this.hoveringTarget = null)}
                >
                  <img
                    class="h-[68px] m-3"
                    style={{ borderRadius: '50%', backgroundColor: 'rgba(0, 16, 27, 0.7)' }}
                    src={this.hoveringTarget === 'center-play' ? playIcon1 : playIcon}
                    onClick={() => this.videoRef.play()}
                  />
                </div>
              </div>
            )}
            {this.shouldShowLoading && (
              <div class="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
                <img class="h-[100px]" src={spinnerImg} alt="加载中.." />
              </div>
            )}
            {this.shouldShowControl && (
              <div class="absolute left-0 bottom-0 w-full h-full pointer-events-none">
                <div class="w-full control-bar absolute bottom-0 left-0 h-[48px] flex justify-between pointer-events-auto">
                  <emiya-video-progress-bar class="absolute bottom-[100%] left-0 w-full" key={this.src} videoRef={this.videoRef} />
                  <div class="left pl-3">
                    <div
                      class="flex items-center justify-center cursor-pointer h-full w-[34px]"
                      onPointerEnter={() => (this.hoveringTarget = 'play')}
                      onPointerLeave={() => (this.hoveringTarget = null)}
                    >
                      {this.isPlaying ? (
                        <img class="h-[20px]" src={this.hoveringTarget === 'play' ? pauseIcon1 : pauseIcon} onClick={() => this.videoRef.pause()} />
                      ) : (
                        <img class="h-[20px]" src={this.hoveringTarget === 'play' ? playIcon1 : playIcon} onClick={() => this.videoRef.play()} />
                      )}
                    </div>
                  </div>
                  <div class="right flex items-center h-full pr-3">
                    <volume-controller class="h-full" videoRef={this.videoRef} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </emiya-teleport>
      </Host>
    );
  }
}
