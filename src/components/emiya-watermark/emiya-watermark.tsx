import { Component, h, Host, State } from '@stencil/core';

@Component({
  tag: 'emiya-watermark',
  styleUrl: 'emiya-watermark.scss',
})
export class EmiyaWatermark {
  @State() rect: DOMRectReadOnly;
  @State() unitRect: DOMRectReadOnly;
  @State() count: number = 1;

  unitRef: HTMLDivElement;
  unitObserver: ResizeObserver;
  observer: ResizeObserver;
  containerRef: HTMLElement;

  observeWatermarkContainer() {
    this.unitObserver = new ResizeObserver(entries => {
      this.unitRect = entries[0].contentRect;
    });
    this.observer = new ResizeObserver(entries => {
      this.rect = entries[0].contentRect;
    });

    this.unitObserver.observe(this.unitRef);
    this.observer.observe(this.containerRef);
  }

  componentDidLoad() {
    this.observeWatermarkContainer();
  }

  componentWillUnload() {
    this.unitObserver.disconnect();
    this.observer.disconnect();
  }

  get realCount() {
    if (!this.rect || !this.unitRect) return 1;
    const cols = this.rect.width / this.unitRect.width;
    const rows = this.rect.height / this.unitRect.height;
    return Math.max(1, Math.ceil(cols * rows));
  }

  render() {
    const unit = (
      <div class="emiya-watermark-unit inline-block p-12">
        <div class="text-white opacity-[.3]" style={{ transform: 'rotate(-45deg)', transformOrigin: '50% 50%' }}>
          Emiya
        </div>
      </div>
    );
    return (
      <Host class="emiya-watermark pointer-events-none absolute left-0 top-0 h-full w-full flex flex-wrap items-center justify-between" ref={a => (this.containerRef = a)}>
        <div class="inline-block opacity-0 absolute top-[100%] right-[100%]" ref={a => (this.unitRef = a)}>
          {unit}
        </div>
        {[...new Array(this.realCount)].map(() => unit)}
      </Host>
    );
  }
}
