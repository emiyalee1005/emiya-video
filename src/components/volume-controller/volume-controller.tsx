import { Component, h, Listen, Prop, State, Watch } from '@stencil/core';
import icon from './assets/volume.svg';
import icon1 from './assets/volume1.svg';

@Component({
  tag: 'volume-controller',
  styleUrl: 'volume-controller.scss',
})
export class VolumeController {
  @Prop() videoRef: HTMLVideoElement;

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

  componentWillUnload() {
    if (this.videoRef) {
      this.videoRef.removeEventListener('volumechange', this.volumechangeHandler);
    }
  }

  @Listen('onIsDraggingChange') onIsDraggingChange(event: CustomEvent<boolean>) {
    this.isDragging = event.detail;
  }

  @Listen('onVisibilityChange') onVisibilityChange(event: CustomEvent<boolean>) {
    this.isBarVisible = event.detail;
  }

  render() {
    return (
      <emiya-tooltip forceVisible={this.isDragging} class="h-full">
        <div slot="trigger" class="h-full min-w-[34px] flex items-center justify-center cursor-pointer">
          <img class="!h-[16px]" src={this.isBarVisible ? icon1 : icon}></img>
        </div>
        <div>
          <emiya-vertical-slider
            class="m-3"
            style={{ height: '100px' }}
            value={this.volume * 100}
            onChange={a => this.videoRef && (this.videoRef.volume = a / 100)}
          ></emiya-vertical-slider>
        </div>
      </emiya-tooltip>
    );
  }
}
