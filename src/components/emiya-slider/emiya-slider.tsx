import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'emiya-slider',
  styleUrl: 'emiya-slider.scss',
  shadow: true,
})
export class EmiyaSlider {
  @Prop() value: number = 0;
  @Prop() min: number = 0;
  @Prop() max: number = 100;

  render() {
    return (
      <div class="slider-container">
        <div class="progress-bar" style={{ width: `${this.value}%` }}></div>
        <div class="slider" style={{ left: `${this.value}%` }} onPointerDown={e => this.handlePointerDown(e)}></div>
      </div>
    );
  }

  handlePointerDown(e: PointerEvent) {
    const slider = e.currentTarget as HTMLElement;
    const container = slider.parentElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    let startX = e.clientX;
    let startValue = this.value;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startX;
      const newValue = startValue + (deltaX / containerRect.width) * 100;
      this.value = Math.min(Math.max(newValue, this.min), this.max);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }
}
