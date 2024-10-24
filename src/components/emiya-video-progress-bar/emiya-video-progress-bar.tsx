import { Component, h, Host, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-video-progress-bar',
  styleUrl: 'emiya-video-progress-bar.scss',
})
export class EmiyaVideoProgressBar {
  @Prop() reverseXY?: boolean;
  @Prop() onCurrentTimeChange?: (a: number) => void;
  @Prop() onDurationChange?: (a: number) => void;
  @Prop() videoRef?: HTMLVideoElement | undefined;

  @State() duration = 0;
  @State() currentTime = 0;

  get progressInPercentage() {
    if (!this.duration) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  durationchangeHandler: any;
  timeupdateHandler: any;

  @Watch('duration')
  watchDurationChange(newValue: number) {
    this.onDurationChange && this.onDurationChange(newValue);
  }

  @Watch('currentTime')
  watchCurrentTimeChange(newValue: number) {
    this.onCurrentTimeChange && this.onCurrentTimeChange(newValue);
  }

  @Watch('videoRef')
  onVideoRefChange(newValue: HTMLVideoElement, oldValue: HTMLVideoElement) {
    if (oldValue) {
      oldValue.removeEventListener('durationchange', this.durationchangeHandler);
      oldValue.removeEventListener('timeupdate', this.timeupdateHandler);
    }
    if (newValue) {
      this.videoRef.addEventListener(
        'durationchange',
        (this.durationchangeHandler = () => {
          this.duration = this.videoRef.duration;
        }),
      );
      this.videoRef.addEventListener(
        'timeupdate',
        (this.timeupdateHandler = () => {
          this.currentTime = this.videoRef.currentTime;
        }),
      );
      this.durationchangeHandler();
      this.timeupdateHandler();
    }
  }

  componentDidLoad() {
    this.onVideoRefChange(this.videoRef, undefined);
  }

  componentWillUnload() {
    if (this.videoRef) {
      this.videoRef.removeEventListener('durationchange', this.durationchangeHandler);
      this.videoRef.removeEventListener('timeupdate', this.timeupdateHandler);
    }
  }

  onChangeProgress(progress: number) {
    if (!this.videoRef) return;
    this.currentTime = this.videoRef.currentTime = this.duration * (progress / 100);
  }

  render() {
    return (
      <Host>
        <emiya-slider reverseXY={this.reverseXY} value={this.progressInPercentage} onChange={a => this.onChangeProgress(a)}></emiya-slider>
      </Host>
    );
  }
}
