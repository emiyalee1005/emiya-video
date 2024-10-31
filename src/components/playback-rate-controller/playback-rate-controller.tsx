import { Component, h, Prop, State, Watch } from '@stencil/core';
import rate from './assets/rate.svg';
import rate1 from './assets/rate1.svg';

@Component({
  tag: 'playback-rate-controller',
  styleUrl: 'playback-rate-controller.scss',
})
export class PlaybackRateController {
  @Prop() videoRef: HTMLVideoElement;
  tooltipRef: HTMLEmiyaTooltipElement;
  @State() isBarVisible = false;
  @State() value: number;

  ratechangeListener: any;

  @Watch('videoRef')
  onVideoRefChange(newValue: HTMLVideoElement, oldValue: HTMLVideoElement) {
    if (oldValue) {
      oldValue.removeEventListener('ratechange', this.ratechangeListener);
    }
    if (newValue) {
      this.videoRef.addEventListener(
        'ratechange',
        (this.ratechangeListener = () => {
          this.value = this.videoRef.playbackRate;
        }),
      );
      this.ratechangeListener();
    }
  }

  componentDidLoad() {
    this.onVideoRefChange(this.videoRef, undefined);
  }

  componentWillUnload() {
    if (this.videoRef) {
      this.videoRef.removeEventListener('volumechange', this.ratechangeListener);
    }
  }

  onVisibilityChange(event: boolean) {
    this.isBarVisible = event;
  }

  get actualOptions() {
    return [
      {
        id: 2,
        name: '2.0X',
      },
      {
        id: 1.75,
        name: '1.75X',
      },
      {
        id: 1.5,
        name: '1.5X',
      },
      {
        id: 1.25,
        name: '1.25X',
      },
      {
        id: 1,
        name: '1.0X',
      },
      {
        id: 0.75,
        name: '0.75X',
      },
      {
        id: 0.5,
        name: '0.5X',
      },
      {
        id: 0.25,
        name: '0.25X',
      },
    ];
  }

  render() {
    return (
      <emiya-tooltip ref={a => (this.tooltipRef = a)} onVisibilityChange={this.onVisibilityChange.bind(this)} class="h-full">
        <div slot="trigger" class="h-full min-w-[34px] flex items-center justify-center cursor-pointer">
          <img class="!h-[16px]" src={this.isBarVisible ? rate1 : rate}></img>
        </div>
        <div class="px-2 text-xs">
          {this.actualOptions.map(a => (
            <div
              key={a.id}
              style={{ color: a.id === this.value ? '#E12617' : '' }}
              class={`text-center my-2 cursor-pointer whitespace-nowrap`}
              onClick={() => {
                this.videoRef && (this.videoRef.playbackRate = a.id);
                this.tooltipRef.setVisibility(false);
              }}
            >
              {a.name}
            </div>
          ))}
        </div>
      </emiya-tooltip>
    );
  }
}
