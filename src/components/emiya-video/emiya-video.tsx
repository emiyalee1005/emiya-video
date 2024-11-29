import { Component, h, Host, Method, Prop, State, Watch } from '@stencil/core';
import devtools from 'devtools-detect';
import Hammer from 'hammerjs';
import Hls, { Level } from 'hls.js';
import { OssHelper } from '../../utils/oss';
import { exitFullscreen, isFullScreen, isIphone, isMobile, isWechat, requestFullscreen } from '../../utils/utils';
import errorImg from './assets/error.svg';
import fullscreen from './assets/fullscreen.svg';
import fullscreen1 from './assets/fullscreen1.svg';
import pauseIcon from './assets/pause.svg';
import pauseIcon1 from './assets/pause1.svg';
import playIcon from './assets/play.svg';
import playIcon1 from './assets/play1.svg';
import smallscreen from './assets/smallscreen.svg';
import smallscreen1 from './assets/smallscreen1.svg';
import spinnerImg from './assets/spinner.svg';

export type VideoStatus = 'idle' | 'loading' | 'loaded' | 'canPlay' | 'waiting' | 'play' | 'playing' | 'paused' | 'ended' | 'error';
const defaultAutoHideControlDelay = 6000;

@Component({
  tag: 'emiya-video',
  styleUrl: 'emiya-video.scss',
  scoped: true,
})
export class EmiyaVideo {
  @Prop() watermark?: string;
  @Prop() src?: string;
  @Prop() autoHideControlDelay?: number = 6000;
  @Prop() onStatusChange?: (status: VideoStatus, message?: any) => any;
  @Prop() onPlaybackRateChange?: (duration: number) => any;
  @Prop() onDurationChange?: (duration: number) => any;
  @Prop() onFullScreenChange?: (fullScreen: boolean) => any;
  @Prop() onCurrentTimeChange?: (currentTime: number) => any;
  @Prop() onLevelsChange?: (levels: { id: number; name: string; level?: Level }[]) => any;
  @Prop() onLevelChange?: (level: number) => any;
  @Prop() onVolumeChange?: (volume: number) => any;
  @Prop() seekable?: boolean = true;

  @State() orientationType: OrientationType = window.screen.orientation.type;
  @State() currentTime: number = 0;
  @State() duration: number = 0;
  @State() hoveringTarget: 'fullscreen' | 'center-play' | 'play' | null = null;
  @State() isFullScreen: boolean = false;
  @State() status: VideoStatus = 'loaded';
  @State() isMouseHover: boolean = false;
  @State() isPointerRecentlyMoved: boolean = false;
  @State() isRecentlyClicked: boolean = false;
  @State() levels: { id: number; name: string; level?: Level }[] = [];
  @State() autoLevelEnabled: boolean = true;
  @State() currentLevel: number = -1;
  @State() error?: any;

  volumeControllerRef: HTMLVolumeControllerElement;

  hb: any;
  hf: any;
  pointerMoveFlagAutoClearListener: any;
  hls: Hls;
  hostRef: Element;
  videoRef: HTMLVideoElement;
  keyupListener: any;
  orientationListener: any;
  fullscreenListener: any;
  removeRecentlyClickedStatusTimer: any;
  backwardSkipRef: HTMLDivElement;
  forwardSkipRef: HTMLDivElement;

  devToolsChangeListener: any;

  @Watch('status')
  watchStatusChange(newValue: VideoStatus) {
    this.onStatusChange && this.onStatusChange(newValue, newValue === 'error' ? this.error : undefined);
  }

  @Method()
  async getStatus() {
    return this.status;
  }

  @Watch('isFullScreen')
  watchFullScreenChange(newValue: boolean) {
    this.onFullScreenChange && this.onFullScreenChange(newValue);
  }

  @Method()
  async mute() {
    return this.volumeControllerRef.mute();
  }

  @Method()
  async unmute() {
    return this.volumeControllerRef.unmute();
  }

  @Method()
  async getDuration() {
    return this.duration;
  }

  @Method()
  async getCurrentTime() {
    return this.videoRef.currentTime;
  }

  @Method()
  async getFullScreen() {
    return this.isFullScreen;
  }

  @Method()
  setFullScreen(value: boolean) {
    this.isFullScreen = value;
  }

  @Watch('levels')
  watchLevelsChange(newValue: any[]) {
    this.onLevelsChange && this.onLevelsChange(newValue);
  }

  @Method()
  async getLevels() {
    return this.levels;
  }

  @Method()
  async getLevel() {
    return this.currentLevel;
  }

  @Method()
  setLevel(level: number) {
    this.onSelectLevel(level);
  }

  @Method()
  async getVolume() {
    return this.videoRef.volume * 100;
  }

  @Method()
  setVolume(value: number) {
    this.videoRef.volume = value / 100;
  }

  @Method()
  async getPlaybackRate() {
    return this.playbackRate;
  }

  @Method()
  setPlaybackRate(value: number) {
    this.videoRef.playbackRate = value;
  }

  playbackRate = 1;
  onPlaybackRateChangeHandler(value: number) {
    this.playbackRate = value;
    this.onPlaybackRateChange && this.onPlaybackRateChange(this.playbackRate);
  }

  // @Watch('isFullScreen')
  // watchFullScreen(newValue: boolean) {
  //   newValue ? requestFullscreen() : exitFullscreen();
  // }

  @Watch('src')
  async watchSrc(newValue: string) {
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

    if (newValue && !newValue.startsWith('http') && !newValue.startsWith('blob')) {
      this.status = 'loading';
      const ossHelper = new OssHelper({} as any);
      try {
        const url = await ossHelper.getUrl({ videoId: newValue });
        if (newValue !== this.src) return;
        newValue = url;
      } catch (e) {
        this.status = 'error';
        this.error = e;
        throw e;
      }
    }

    this.status = newValue ? (isWechat() ? 'loaded' : 'loading') : 'idle';

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
          this.onLevelChange && this.onLevelChange(this.currentLevel);
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

  onCurrentTimeChangeHandler(event: number) {
    this.currentTime = event || 0;
    this.onCurrentTimeChange && this.onCurrentTimeChange(this.currentTime);
  }
  onDurationChangeHandler(event: number) {
    this.duration = event || 0;
    this.onDurationChange && this.onDurationChange(this.duration);
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
    return this.isRecentlyClicked || this.isPointerRecentlyMoved;
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

  @Method()
  play() {
    return this.videoRef.play();
  }

  @Method()
  pause() {
    return this.videoRef.pause();
  }

  @Method()
  setCurrentTime(time: number) {
    this.currentTime = this.videoRef.currentTime = time;
  }

  playOrPause() {
    this.videoRef.paused ? this.videoRef.play() : this.videoRef.pause();
  }

  componentDidLoad() {
    document.addEventListener('visibilitychange', this.devToolsChangeListener);
    this.hb = new Hammer(this.backwardSkipRef);
    this.hb.on('doubletap', () => {
      this.fastJump(-5);
    });

    this.hf = new Hammer(this.forwardSkipRef);
    this.hf.on('doubletap', () => {
      this.fastJump(5);
    });

    this.videoRef.disablePictureInPicture = true;
    this.videoRef.disableRemotePlayback = true;
    this.videoRef.setAttribute('controlsList', 'nodownload');
    window.addEventListener(
      'keyup',
      (this.keyupListener = a => {
        switch (a.keyCode || a.which) {
          case 38:
            // 上键被按下
            break;
          case 32: //space
            this.playOrPause();
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
      if (!isMobile() && location.hostname !== 'localhost' && (devtools.isOpen || a?.detail?.isOpen)) {
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
        if (isIphone()) return;
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
    document.addEventListener('visibilitychange', this.devToolsChangeListener);
    this.hb.destroy();
    this.hf.destroy();
  }

  onVideoLoadedData() {
    this.status = 'loaded';
  }

  onVideoEnded() {
    this.status = 'ended';
  }

  onVideoError(error: any) {
    this.status = 'error';
    this.error = error;
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

  onMouseMove() {
    this.isPointerRecentlyMoved = true;
    clearTimeout(this.pointerMoveFlagAutoClearListener);
    this.pointerMoveFlagAutoClearListener = setTimeout(
      () => (this.isPointerRecentlyMoved = false),
      this.autoHideControlDelay >= 0 ? this.autoHideControlDelay : defaultAutoHideControlDelay,
    );
  }

  onMouseLeave() {
    this.isMouseHover = false;
    this.isPointerRecentlyMoved = false;
    this.isRecentlyClicked = false;
    clearTimeout(this.pointerMoveFlagAutoClearListener);
    this.pointerMoveFlagAutoClearListener = undefined;
    clearTimeout(this.removeRecentlyClickedStatusTimer);
    this.removeRecentlyClickedStatusTimer = undefined;
  }

  fastJump(length: number) {
    if (!this.seekable) return;
    if (this.videoRef.duration > 0) {
      this.videoRef.currentTime = Math.max(0, Math.min(this.videoRef.duration, this.videoRef.currentTime + length));
    }
  }

  lastClickTime: number = 0;
  dbClickInterval = 200;
  initialPointerEl: HTMLElement | undefined;
  onPointerDown(a: PointerEvent) {
    this.initialPointerEl = a.target as any;
  }

  onClick(_1: PointerEvent) {
    if (!this.initialPointerEl || !this.initialPointerEl.classList?.contains('emiya-video-control-backdrop')) {
      this.initialPointerEl = undefined;
      return;
    } else this.initialPointerEl = undefined;
    const time = Date.now();
    if (time - this.lastClickTime <= this.dbClickInterval) {
      this.lastClickTime = time;
      return;
    }
    this.lastClickTime = time;
    setTimeout(() => {
      if (time !== this.lastClickTime) return;
      if (this.shouldShowCenterPlay || this.shouldShowControl) {
        this.playOrPause();
      }
      this.onRecentClick();
    }, this.dbClickInterval);
  }

  onRecentClick() {
    this.isRecentlyClicked = true;
    clearTimeout(this.removeRecentlyClickedStatusTimer);
    this.removeRecentlyClickedStatusTimer = setTimeout(
      () => {
        this.isRecentlyClicked = false;
        this.removeRecentlyClickedStatusTimer = undefined;
      },
      this.autoHideControlDelay >= 0 ? this.autoHideControlDelay : defaultAutoHideControlDelay,
    );
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
            onPointerMove={() => this.onMouseMove()}
            onPointerLeave={a => a.pointerType === 'mouse' && this.onMouseLeave()}
            onPointerCancel={() => this.onMouseLeave()}
          >
            <video
              playsInline={true}
              playsinline={true}
              preload="auto"
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
              class="w-full h-full select-none"
              controls={false}
              onEnded={() => this.onVideoEnded()}
              onError={a => this.onVideoError(a)}
              onCanPlay={() => this.onVideoCanPlay()}
              onWaiting={() => this.onVideoWaiting()}
              onPlaying={() => this.onVideoPlaying()}
              onPause={() => this.onVideoPaused()}
              onPlay={() => this.onVideoPlay()}
              onLoadedData={() => this.onVideoLoadedData()}
            />
            <emiya-watermark value={this.watermark} />
            <div
              class="emiya-video-control-backdrop absolute left-0 bottom-0 w-full h-full cursor-pointer flex"
              onPointerDown={this.onPointerDown.bind(this)}
              onPointerUp={a => this.onClick(a)}
            >
              <div class="emiya-video-control-backdrop flex-1 h-full" ref={a => (this.backwardSkipRef = a)}></div>
              <div class="emiya-video-control-backdrop flex-1 h-full flex items-center justify-center">
                {this.shouldShowCenterPlay && (
                  <div
                    class="emiya-video-control-backdrop pointer-events-auto flex items-center justify-center cursor-pointer"
                    onPointerEnter={() => (this.hoveringTarget = 'center-play')}
                    onPointerLeave={() => (this.hoveringTarget = null)}
                  >
                    <img
                      class="emiya-video-control-backdrop h-[68px] m-3"
                      style={{ borderRadius: '50%', backgroundColor: 'rgba(0, 16, 27, 0.7)' }}
                      src={this.hoveringTarget === 'center-play' ? playIcon1 : playIcon}
                    />
                  </div>
                )}
                {this.status === 'error' && <img class="emiya-video-control-backdrop h-[100px]" src={errorImg} alt="无法播放" />}
                {this.shouldShowLoading && <img class="emiya-video-control-backdrop h-[100px]" src={spinnerImg} alt="加载中.." />}
              </div>
              <div class="emiya-video-control-backdrop flex-1 h-full" ref={a => (this.forwardSkipRef = a)}></div>
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
            {(true || this.shouldShowControl) && (
              <div
                key={this.isFullScreen ? 1 : 0}
                class={`absolute left-0 bottom-0 w-full h-full pointer-events-none ${this.shouldShowControl ? '' : 'hidden'}`}
                onClick={this.onRecentClick.bind(this)}
              >
                <div class="w-full control-bar absolute bottom-0 left-0 h-[48px] flex justify-between pointer-events-auto">
                  <emiya-video-progress-bar
                    allowSeek={this.seekable}
                    reverseXY={this.shouldRotate}
                    class="absolute bottom-[100%] left-0 w-full"
                    onCurrentTimeChange={this.onCurrentTimeChangeHandler.bind(this)}
                    onDurationChange={this.onDurationChangeHandler.bind(this)}
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
                    <volume-controller
                      reverseXY={this.shouldRotate}
                      class="h-full mr-1"
                      ref={el => (this.volumeControllerRef = el)}
                      videoRef={this.videoRef}
                      onChange={e => this.onVolumeChange && this.onVolumeChange(e)}
                    />
                    <playback-rate-controller class="h-full mr-1" videoRef={this.videoRef} onChange={a => this.onPlaybackRateChangeHandler(a as any)} />
                    <div
                      class="flex items-center justify-center cursor-pointer h-full w-[34px]"
                      onPointerEnter={() => (this.hoveringTarget = 'fullscreen')}
                      onPointerLeave={() => (this.hoveringTarget = null)}
                    >
                      {this.isFullScreen ? (
                        <img class="h-[20px]" src={this.hoveringTarget === 'fullscreen' ? smallscreen1 : smallscreen} onClick={exitFullscreen} />
                      ) : (
                        <img
                          class="h-[20px]"
                          src={this.hoveringTarget === 'fullscreen' ? fullscreen1 : fullscreen}
                          onClick={() => {
                            if (isIphone()) {
                              this.videoRef['webkitEnterFullscreen']();
                            } else requestFullscreen();
                          }}
                        />
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
