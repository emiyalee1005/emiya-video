import { Component, h, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-slider',
  styleUrl: 'emiya-slider.scss',
})
export class EmiyaSlider {
  @Prop() reverseXY?: boolean;
  @Prop() realtime?: boolean = true;
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

  get unit() {
    return this.reverseXY
      ? {
          XY: 'Y',
          wh: 'height',
        }
      : {
          XY: 'X',
          wh: 'width',
        };
  }

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
      <div class="emiya-slider select-none" style={{ _padding: `0 ${this.slideHandleRadius}px` }} onTouchStart={a => a.preventDefault()} onContextMenu={a => a.preventDefault()}>
        <div
          onPointerDown={e => this.handleBarDown(e)}
          class={{ 'slider-container': true, 'focused': this.isDragging }}
          style={{ height: `${this.progressBarHeight}px`, backgroundColor: this.progressBarBaseColor }}
        >
          <div class="progress-bar" style={{ backgroundColor: this.progressBarLeftColor, width: `${this.renderedValue}%` }}></div>
          <div
            class={{ slider: true, show: this.isDragging }}
            style={{
              width: `${this.slideHandleRadius * 2}px`,
              height: `${this.slideHandleRadius * 2}px`,
              top: `${-(this.slideHandleRadius - this.progressBarHeight / 2)}px`,
              left: `${this.renderedValue}%`,
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
    this.onChange && this.onChange((this.tempValue = (e[`offsetX`] / containerRect[this.unit.wh]) * 100));
    this.handlePointerDown(e);
  }

  handlePointerDown(e: PointerEvent) {
    e.stopPropagation();
    const slider = e.currentTarget as HTMLElement;
    const container = slider.parentElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    this.setIsDragging(true);
    let startX = e[`client${this.unit.XY}`];
    let startValue = this.renderedValue;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e[`client${this.unit.XY}`] - startX;
      const scale = this.reverseXY ? deltaX / containerRect[this.unit.wh] : deltaX / containerRect[this.unit.wh];
      const newValue = startValue + scale * 100;
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
