import { Component, h, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-video-progress-bar',
  styleUrl: 'emiya-video-progress-bar.scss',
  shadow: true,
})
export class EmiyaVideoProgressBar {
  @Prop() videoRef: HTMLVideoElement;

  @State() duration = 0;
  @State() currentTime = 0;

  get progressInPercentage() {
    if (!this.duration) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  @Watch('videoRef')
  onVideoRefChange() {
    this.videoRef.addEventListener('durationchange', () => {
      this.duration = this.videoRef.duration;
    });
    this.videoRef.addEventListener('timeupdate', () => {
      this.currentTime = this.videoRef.currentTime;
    });
  }

  onChangeProgress(progress: number) {
    this.currentTime = this.videoRef.currentTime = this.duration * (progress / 100);
  }

  render() {
    return (
      <div>
        <emiya-slider value={this.progressInPercentage} onChange={a => this.onChangeProgress(a)}></emiya-slider>
      </div>
    );
  }
}
