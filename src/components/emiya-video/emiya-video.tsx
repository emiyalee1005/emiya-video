import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import devtools from 'devtools-detect';
import Hls, { Level } from 'hls.js';
import { exitFullscreen, isFullScreen, isMobile, requestFullscreen } from '../../utils/utils';
import fullscreen from './assets/fullscreen.svg';
import fullscreen1 from './assets/fullscreen1.svg';
import pauseIcon from './assets/pause.svg';
import pauseIcon1 from './assets/pause1.svg';
import playIcon from './assets/play.svg';
import playIcon1 from './assets/play1.svg';
import smallscreen from './assets/smallscreen.svg';
import smallscreen1 from './assets/smallscreen1.svg';
import spinnerImg from './assets/spinner.svg';

@Component({
  tag: 'emiya-video',
  styleUrl: 'emiya-video.scss',
  scoped: true,
})
export class EmiyaVideo {
  @Prop() src?: string;

  @State() orientationType: OrientationType = window.screen.orientation.type;
  @State() currentTime: number = 0;
  @State() duration: number = 0;
  @State() hoveringTarget: 'fullscreen' | 'center-play' | 'play' | null = null;
  @State() isFullScreen: boolean = false;
  @State() status: 'idle' | 'loading' | 'loaded' | 'canPlay' | 'waiting' | 'play' | 'playing' | 'paused' | 'ended' | 'error' = 'loaded';
  @State() isMouseHover: boolean = false;
  @State() isRecentlyClicked: boolean = false;
  @State() levels: { id: number; name: string; level?: Level }[] = [];
  @State() autoLevelEnabled: boolean = true;
  @State() currentLevel: number = -1;

  hls: Hls;
  hostRef: Element;
  videoRef: HTMLVideoElement;
  keyupListener: any;
  orientationListener: any;
  fullscreenListener: any;
  removeRecentlyClickedStatusTimer: any;

  devToolsChangeListener: any;

  // @Watch('isFullScreen')
  // watchFullScreen(newValue: boolean) {
  //   newValue ? requestFullscreen() : exitFullscreen();
  // }

  @Watch('src')
  watchSrc(newValue: string) {
    this.status = newValue ? 'loading' : 'idle';
    this.levels = [];
    this.autoLevelEnabled = true;
    this.currentLevel = -1;
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
          if (this.autoLevelEnabled) this.hls.currentLevel = -1;
          this.levels = this.hls.levels.map(function (level, index) {
            return {
              level,
              id: index,
              name: `${level.name}p`,
            };
          });
          //console.log('可用分辨率: ', this.levels);
        });

        const onLevelChange = (_1?: any, _2?: any) => {
          this.currentLevel = this.hls.currentLevel;
          //console.log('当前分辨率: ', this.currentLevel);
        };

        this.hls.on(Hls.Events.LEVEL_SWITCHED, onLevelChange);

        onLevelChange();
      } else if (this.videoRef.canPlayType('application/vnd.apple.mpegurl')) {
        alert('浏览器版本过低，请升级');
        //this.videoRef.src = newValue;
      } else {
        alert('浏览器版本过旧，请升级');
      }
    }
  }

  onCurrentTimeChange(event: number) {
    this.currentTime = event || 0;
  }
  onDurationChange(event: number) {
    this.duration = event || 0;
  }

  onSelectLevel(level: number) {
    if (level === -1) this.autoLevelEnabled = true;
    else this.autoLevelEnabled = false;
    this.currentLevel = this.hls.currentLevel = level;
  }

  get shouldShowLoading() {
    return this.status === 'loading' || this.status === 'waiting';
  }

  get shouldShowCenterPlay() {
    return this.status === 'paused' || this.status === 'loaded' || this.status === 'canPlay' || this.status === 'ended';
  }

  get shouldShowControl() {
    return true || this.isRecentlyClicked || this.isMouseHover;
  }

  get isPlaying() {
    return this.status === 'playing' || this.status === 'play' || this.status === 'waiting';
  }

  get shouldRotate() {
    if (isMobile() && (this.orientationType === 'portrait-primary' || this.orientationType === 'portrait-secondary') && this.isFullScreen) {
      return true;
    }
    if ((this.orientationType === 'landscape-primary' || this.orientationType === 'landscape-secondary') && this.isFullScreen) {
      return false;
    }
    return false;
  }

  get rotateStyle() {
    return this.shouldRotate
      ? {
          transform: 'rotate(90deg) translateY(-100%)',
          transformOrigin: '0 0',
          width: '100vh',
          height: '100vw',
        }
      : {
          width: '100%',
          height: '100%',
        };
  }

  componentDidLoad() {
    window.addEventListener(
      'keyup',
      (this.keyupListener = a => {
        switch (a.keyCode || a.which) {
          case 38:
            // 上键被按下
            break;
          case 40:
            // 下键被按下
            break;
          case 37:
            // 左键被按下
            this.fastJump(-5);
            break;
          case 39:
            // 右键被按下
            this.fastJump(5);
            break;
        }
      }),
    );
    this.devToolsChangeListener = (a?: any) => {
      if (location.port !== '3333' && (devtools.isOpen || a?.detail?.isOpen)) {
        location.href = 'about:blank';
      }
    };
    window.addEventListener(
      'orientationchange',
      (this.orientationListener = () => {
        this.orientationType = window.screen.orientation.type;
      }),
    );
    this.orientationListener();
    document.addEventListener(
      'fullscreenchange',
      (this.fullscreenListener = () => {
        this.isFullScreen = isFullScreen();
      }),
    );
    this.fullscreenListener();
    window.addEventListener('devtoolschange', this.devToolsChangeListener);
    this.devToolsChangeListener();
    this.watchSrc(this.src);
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
    window.removeEventListener('keyup', this.keyupListener);
    window.removeEventListener('orientationchange', this.orientationListener);
    document.removeEventListener('fullscreenchange', this.fullscreenListener);
    window.removeEventListener('devtoolschange', this.devToolsChangeListener);
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

  fastJump(length: number) {
    if (this.videoRef.duration > 0) {
      this.videoRef.currentTime = Math.max(0, Math.min(this.videoRef.duration, this.videoRef.currentTime + length));
    }
  }

  lastClickTime: number = 0;
  dbClickInterval = 200;
  onClick(_1: PointerEvent) {
    const time = Date.now();
    if (time - this.lastClickTime <= this.dbClickInterval) {
      this.lastClickTime = time;
      return;
    }
    this.lastClickTime = time;
    setTimeout(() => {
      if (time !== this.lastClickTime) return;
      if (this.shouldShowCenterPlay || this.shouldShowControl) {
        this.videoRef.paused ? this.videoRef.play() : this.videoRef.pause();
      }
      this.isRecentlyClicked = true;
      clearTimeout(this.removeRecentlyClickedStatusTimer);
      this.removeRecentlyClickedStatusTimer = setTimeout(() => {
        this.isRecentlyClicked = false;
        this.removeRecentlyClickedStatusTimer = undefined;
      }, 6000);
    }, this.dbClickInterval);
  }

  render() {
    return (
      <Host ref={a => (this.hostRef = a)}>
        <emiya-teleport targetSelector={this.isFullScreen ? 'body' : undefined}>
          <div
            onContextMenu={a => {
              a.preventDefault();
              a.stopPropagation();
              a.returnValue = false;
              return false;
            }}
            style={this.rotateStyle}
            class={`emiya-video-portable ${this.isFullScreen ? 'fixed top-0 left-0' : 'relative'} bg-black text-white w-full h-full select-none`}
            onPointerEnter={a => a.pointerType === 'mouse' && this.onMouseEnter()}
            onPointerLeave={a => a.pointerType === 'mouse' && this.onMouseLeave()}
            onPointerCancel={() => this.onMouseLeave()}
          >
            <video
              onContextMenu={a => {
                a.preventDefault();
                a.stopPropagation();
                a.returnValue = false;
                return false;
              }}
              ref={a => (this.videoRef = a)}
              key={this.src}
              // src={this.src}
              autoplay={false}
              class="w-full h-full pointer-events-none select-none"
              controls={false}
              onError={() => this.onVideoError()}
              onCanPlay={() => this.onVideoCanPlay()}
              onWaiting={() => this.onVideoWaiting()}
              onPlaying={() => this.onVideoPlaying()}
              onPause={() => this.onVideoPaused()}
              onPlay={() => this.onVideoPlay()}
              onLoadedData={() => this.onVideoLoadedData()}
            />
            <div class="absolute left-0 bottom-0 w-full h-full cursor-pointer flex" onPointerUp={a => this.onClick(a)}>
              <div class="flex-1 h-full" onDblClick={() => this.fastJump(-5)}></div>
              <div class="flex-1 h-full flex items-center justify-center">
                {this.shouldShowCenterPlay && (
                  <div
                    class="pointer-events-auto flex items-center justify-center cursor-pointer"
                    onPointerEnter={() => (this.hoveringTarget = 'center-play')}
                    onPointerLeave={() => (this.hoveringTarget = null)}
                  >
                    <img
                      class="h-[68px] m-3"
                      style={{ borderRadius: '50%', backgroundColor: 'rgba(0, 16, 27, 0.7)' }}
                      src={this.hoveringTarget === 'center-play' ? playIcon1 : playIcon}
                    />
                  </div>
                )}
                {this.shouldShowLoading && <img class="h-[100px]" src={spinnerImg} alt="加载中.." />}
              </div>
              <div class="flex-1 h-full" onDblClick={() => this.fastJump(5)}></div>
            </div>
            {/*{this.shouldShowCenterPlay && (*/}
            {/*  <div class="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">*/}
            {/*    <div*/}
            {/*      class="pointer-events-auto flex items-center justify-center cursor-pointer"*/}
            {/*      onPointerEnter={() => (this.hoveringTarget = 'center-play')}*/}
            {/*      onPointerLeave={() => (this.hoveringTarget = null)}*/}
            {/*    >*/}
            {/*      <img*/}
            {/*        class="h-[68px] m-3"*/}
            {/*        style={{ borderRadius: '50%', backgroundColor: 'rgba(0, 16, 27, 0.7)' }}*/}
            {/*        src={this.hoveringTarget === 'center-play' ? playIcon1 : playIcon}*/}
            {/*        onPointerUp={a => this.onClick(a)}*/}
            {/*      />*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*)}*/}
            {/*{this.shouldShowLoading && (*/}
            {/*  <div class="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">*/}
            {/*    <img class="h-[100px]" src={spinnerImg} alt="加载中.." />*/}
            {/*  </div>*/}
            {/*)}*/}
            {this.shouldShowControl && (
              <div key={this.isFullScreen ? 1 : 0} class="absolute left-0 bottom-0 w-full h-full pointer-events-none">
                <div class="w-full control-bar absolute bottom-0 left-0 h-[48px] flex justify-between pointer-events-auto">
                  <emiya-video-progress-bar
                    reverseXY={this.shouldRotate}
                    class="absolute bottom-[100%] left-0 w-full"
                    onCurrentTimeChange={this.onCurrentTimeChange.bind(this)}
                    onDurationChange={this.onDurationChange.bind(this)}
                    key={this.src}
                    videoRef={this.videoRef}
                  />
                  <div class="left pl-3 flex items-center">
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
                    <span class="ml-4 text-sm">
                      {formatTime(this.currentTime)} / {formatTime(this.duration)}
                    </span>
                  </div>
                  <div class="right flex items-center h-full pr-3">
                    {!!this.levels.length && (
                      <level-controller class="h-full mr-1" auto={this.autoLevelEnabled} value={this.currentLevel} onChange={a => this.onSelectLevel(a)} options={this.levels} />
                    )}
                    <volume-controller reverseXY={this.shouldRotate} class="h-full mr-1" videoRef={this.videoRef} />
                    <playback-rate-controller class="h-full mr-1" videoRef={this.videoRef} />
                    <div
                      class="flex items-center justify-center cursor-pointer h-full w-[34px]"
                      onPointerEnter={() => (this.hoveringTarget = 'fullscreen')}
                      onPointerLeave={() => (this.hoveringTarget = null)}
                    >
                      {this.isFullScreen ? (
                        <img class="h-[20px]" src={this.hoveringTarget === 'fullscreen' ? smallscreen1 : smallscreen} onClick={exitFullscreen} />
                      ) : (
                        <img class="h-[20px]" src={this.hoveringTarget === 'fullscreen' ? fullscreen1 : fullscreen} onClick={requestFullscreen} />
                      )}
                    </div>
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

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  seconds = Math.round(seconds % 60);

  var formattedTime = '';

  if (hours > 0) {
    formattedTime += hours.toString().padStart(2, '0') + ':';
  }

  if (minutes > 0 || hours > 0 || (!minutes && !hours)) {
    formattedTime += minutes.toString().padStart(2, '0') + ':';
  }

  formattedTime += seconds.toString().padStart(2, '0');

  return formattedTime;
}
