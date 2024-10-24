import { Component, h, Host, Prop, State, Watch } from '@stencil/core';

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
      <Host
        class="emiya-tooltip-trigger relative"
        onPointerDown={a => {
          a.stopPropagation();
          if (a.pointerType !== 'mouse') this.visibleByTouch = !this.visibleByTouch;
        }}
        onPointerEnter={a => a.pointerType === 'mouse' && (this.onTriggerHovered = true)}
        onPointerLeave={a => a.pointerType === 'mouse' && (this.onTriggerHovered = false)}
      >
        <slot name="trigger"></slot>
        <div class={`emiya-tooltip absolute left-0 bottom-[100%] w-full overflow-visible justify-center flex ${this.isActualVisible ? '' : 'hidden'}`}>
          <div
            class={`emiya-tooltip-inner transition-all rounded flex mb-1 ${this.isActualVisible ? '' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: 'rgba(0,16,27,.7)' }}
          >
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
