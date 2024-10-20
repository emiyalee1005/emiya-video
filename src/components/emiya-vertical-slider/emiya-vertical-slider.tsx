import { Component, h, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-vertical-slider',
  styleUrl: 'emiya-vertical-slider.scss',
})
export class EmiyaVerticalSlider {
  @Prop() slideHandleRadius: number = 5;
  @Prop() value: number = 0;
  @Prop() onChange: (value: number) => void;
  @Prop() min: number = 0;
  @Prop() max: number = 100;
  @Prop() progressBarHeight: number = 6;
  @Prop() progressBarBaseColor: string = 'rgba(255, 255, 255, 0.35)';
  @Prop() progressBarLeftColor: string = '#e12617';

  @State() tempValue: number;
  @State() isDragging: boolean = false;

  @Watch('isDragging')
  onDraggingChange(newValue: boolean) {
    if (newValue) {
      this.tempValue = this.value;
    } else {
      this.onChange && this.onChange(this.tempValue);
    }
  }

  render() {
    return (
      <div
        class="emiya-vertical-slider select-none"
        style={{ padding: `${this.slideHandleRadius}px 0` }}
        onTouchStart={a => a.preventDefault()}
        onPointerLeave={() => console.log(1)}
        onContextMenu={a => a.preventDefault()}
      >
        <div
          onPointerDown={e => this.handleBarDown(e)}
          class={{ 'slider-container': true, 'focused': this.isDragging }}
          style={{ width: `${this.progressBarHeight}px`, backgroundColor: this.progressBarBaseColor }}
        >
          <div class="progress-bar" style={{ backgroundColor: this.progressBarLeftColor, height: `${this.renderedValue}%` }}></div>
          <div
            class={{ slider: true, show: this.isDragging }}
            style={{
              width: `${this.slideHandleRadius * 2}px`,
              height: `${this.slideHandleRadius * 2}px`,
              left: `${-(this.slideHandleRadius - this.progressBarHeight / 2)}px`,
              bottom: `${this.renderedValue}%`,
            }}
            onPointerDown={e => this.handlePointerDown(e)}
          ></div>
        </div>
      </div>
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
    this.onChange && this.onChange((this.tempValue = (e.offsetY / containerRect.height) * 100));
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
