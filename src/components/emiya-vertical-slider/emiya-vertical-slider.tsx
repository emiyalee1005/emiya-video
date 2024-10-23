import { Component, h, Host, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-vertical-slider',
  styleUrl: 'emiya-vertical-slider.scss',
})
export class EmiyaVerticalSlider {
  @Prop() realtime?: boolean = true;
  @Prop() onIsDraggingChange?: (a: boolean) => void;
  @Prop() slideHandleRadius: number = 5;
  @Prop() value: number = 0;
  @Prop() onChange: (value: number) => void;
  @Prop() min: number = 0;
  @Prop() max: number = 100;
  @Prop() progressBarWidth: number = 6;
  @Prop() progressBarBaseColor: string = 'rgba(255, 255, 255, 0.35)';
  @Prop() progressBarLeftColor: string = '#e12617';

  @State() tempValue: number;
  @State() isDragging: boolean = false;

  @Watch('isDragging')
  watchIsDraggingChange(newValue: boolean) {
    this.onIsDraggingChange && this.onIsDraggingChange(newValue);
    if (newValue) {
      this.tempValue = this.value;
    } else {
      this.onChange && this.onChange(this.tempValue);
    }
  }

  render() {
    return (
      <Host
        class="emiya-vertical-slider select-none"
        style={{ _padding: `${this.slideHandleRadius}px 0` }}
        onTouchStart={a => a.preventDefault()}
        onContextMenu={a => a.preventDefault()}
      >
        <div
          onPointerDown={e => this.handleBarDown(e)}
          class={{ 'slider-container': true, 'focused': this.isDragging }}
          style={{ width: `${this.progressBarWidth}px`, backgroundColor: this.progressBarBaseColor }}
        >
          <div class="progress-bar pointer-events-none" style={{ backgroundColor: this.progressBarLeftColor, height: `${this.renderedValue}%` }}></div>
          <div
            class={{ slider: true, show: this.isDragging }}
            style={{
              width: `${this.slideHandleRadius * 2}px`,
              height: `${this.slideHandleRadius * 2}px`,
              left: `${-(this.slideHandleRadius - this.progressBarWidth / 2)}px`,
              bottom: `${this.renderedValue}%`,
            }}
            onPointerDown={e => this.handlePointerDown(e)}
          ></div>
        </div>
      </Host>
    );
  }

  get renderedValue() {
    return this.isDragging ? this.tempValue : this.value;
  }

  setIsDragging(isDragging: boolean) {
    if (this.isDragging === isDragging) return;
    this.isDragging = isDragging;
    if (isDragging) {
      this.tempValue = this.value;
    }
  }

  handleBarDown(e: PointerEvent) {
    const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.setIsDragging(true);
    this.onChange && this.onChange((this.tempValue = 100 - (e.offsetY / containerRect.height) * 100));
    this.handlePointerDown(e);
  }

  handlePointerDown(e: PointerEvent) {
    e.stopPropagation();
    const slider = e.currentTarget as HTMLElement;
    const container = slider.parentElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    this.setIsDragging(true);
    let startY = e.clientY;
    let startValue = this.renderedValue;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaY = startY - e.clientY;
      const newValue = startValue + (deltaY / containerRect.height) * 100;
      this.tempValue = Math.min(Math.max(newValue, this.min), this.max);
      this.realtime && this.onChange && this.onChange(this.tempValue);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      this.setIsDragging(false);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }
}
