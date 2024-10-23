import { Component, h, Prop, State, Watch } from '@stencil/core';
import mute from './assets/mute.svg';
import mute1 from './assets/mute1.svg';
import icon from './assets/volume.svg';
import icon1 from './assets/volume1.svg';

@Component({
  tag: 'volume-controller',
  styleUrl: 'volume-controller.scss',
})
export class VolumeController {
  @Prop() videoRef: HTMLVideoElement;

  @State() lastVolume: number;
  @State() isDragging = false;
  @State() isBarVisible = false;
  @State() volume: number = 1;

  volumechangeHandler: any;

  @Watch('videoRef')
  onVideoRefChange(newValue: HTMLVideoElement, oldValue: HTMLVideoElement) {
    if (oldValue) {
      oldValue.removeEventListener('volumechange', this.volumechangeHandler);
    }
    if (newValue) {
      this.videoRef.addEventListener(
        'volumechange',
        (this.volumechangeHandler = () => {
          this.volume = this.videoRef.volume;
        }),
      );
      this.volumechangeHandler();
    }
  }

  componentDidLoad() {
    this.onVideoRefChange(this.videoRef, undefined);
  }

  componentWillUnload() {
    if (this.videoRef) {
      this.videoRef.removeEventListener('volumechange', this.volumechangeHandler);
    }
  }

  onIsDraggingChange(event: boolean) {
    this.isDragging = event;
  }

  onVisibilityChange(event: boolean) {
    this.isBarVisible = event;
  }

  onChangeVolume(volume: number) {
    if (!this.videoRef) return;
    this.volume = this.videoRef.volume = volume / 100;
  }

  mute() {
    if (this.volume) {
      this.lastVolume = this.volume;
      this.onChangeVolume(0);
    } else {
      this.onChangeVolume(100 * (this.lastVolume || 1));
    }
  }

  render() {
    return (
      <emiya-tooltip onVisibilityChange={this.onVisibilityChange.bind(this)} forceVisible={this.isDragging} class="h-full">
        <div slot="trigger" class="h-full min-w-[34px] flex items-center justify-center cursor-pointer" onClick={() => this.mute()}>
          {this.volume ? <img class="!h-[16px]" src={this.isBarVisible ? icon1 : icon}></img> : <img class="!h-[18px]" src={this.isBarVisible ? mute1 : mute}></img>}
        </div>
        <div>
          <emiya-vertical-slider
            onIsDraggingChange={this.onIsDraggingChange.bind(this)}
            class="m-3"
            style={{ height: '100px' }}
            value={this.volume * 100}
            onChange={a => this.onChangeVolume(a)}
          ></emiya-vertical-slider>
        </div>
      </emiya-tooltip>
    );
  }
}
