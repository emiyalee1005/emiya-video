import { Component, h, Method, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-tooltip',
  styleUrl: 'emiya-tooltip.scss',
})
export class EmiyaTooltip {
  @Prop() onVisibilityChange?: (a: boolean) => void;
  @Prop() forceVisible?: boolean | undefined | null;
  @Prop() boundingElement?: HTMLElement | undefined;

  @State() visibleByTouch: boolean = false;
  @State() onTriggerHovered: boolean = false;
  @State() onPopupHovered: boolean = false;

  globalPointerDownListener: any;

  @State() vs = 1;
  @State() isActualVisible: boolean;

  @Watch('forceVisible')
  @Watch('visibleByTouch')
  @Watch('onTriggerHovered')
  watchVisible() {
    if (typeof this.forceVisible === 'boolean') this.isActualVisible = this.forceVisible;
    else if (this.visibleByTouch) this.isActualVisible = true;
    else this.isActualVisible = this.onTriggerHovered;
  }

  @Watch('isActualVisible')
  watchVisibilityChange() {
    this.onVisibilityChange && this.onVisibilityChange(this.isActualVisible);
  }

  @Method()
  setVisibility(visible: boolean) {
    this.onTriggerHovered = visible;
    this.visibleByTouch = visible;
  }

  componentDidLoad() {
    this.watchVisible();
    document.addEventListener(
      'pointerdown',
      (this.globalPointerDownListener = () => {
        this.visibleByTouch = false;
      }),
    );
  }
  componentWillUnload() {
    document.removeEventListener('pointerdown', this.globalPointerDownListener);
  }

  render() {
    return (
      <div class="emiya-tooltip-trigger relative h-full" onPointerLeave={a => a.pointerType === 'mouse' && (this.onTriggerHovered = false)}>
        <div
          class="contents"
          onPointerEnter={a => {
            a.pointerType === 'mouse' && (this.onTriggerHovered = true);
          }}
          onPointerDown={a => {
            setTimeout(() => {
              if (a.pointerType !== 'mouse') this.visibleByTouch = !this.visibleByTouch;
            });
          }}
        >
          <slot name="trigger"></slot>
        </div>
        <div
          class={`emiya-tooltip absolute left-0 bottom-[100%] w-full overflow-visible justify-center flex ${this.isActualVisible ? '' : '!hidden'}`}
          onPointerDown={a => a.stopPropagation()}
        >
          <div
            class={`emiya-tooltip-inner transition-all rounded flex mb-1 ${this.isActualVisible ? '' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: 'rgba(0,16,27,.7)' }}
          >
            <slot></slot>
          </div>
        </div>
      </div>
    );
  }
}
