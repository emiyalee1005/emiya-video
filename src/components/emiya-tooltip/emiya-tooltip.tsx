import { Component, h, Host, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-tooltip',
  styleUrl: 'emiya-tooltip.scss',
})
export class EmiyaTooltip {
  @Prop() onVisibilityChange?: (a: boolean) => void;
  @Prop() forceVisible?: boolean = false;
  @Prop() boundingElement?: HTMLElement | undefined;

  @State() onTriggerHovered: boolean = false;
  @State() onPopupHovered: boolean = false;

  get isVisible() {
    return this.onTriggerHovered || this.forceVisible;
  }

  @Watch('forceVisible')
  @Watch('onTriggerHovered')
  watchVisibilityChange() {
    this.onVisibilityChange && this.onVisibilityChange(this.isVisible);
  }

  render() {
    return (
      <Host class="emiya-tooltip-trigger relative" onPointerEnter={() => (this.onTriggerHovered = true)} onPointerLeave={() => (this.onTriggerHovered = false)}>
        <slot name="trigger"></slot>
        <div class={`emiya-tooltip absolute left-0 bottom-[100%] w-full overflow-visible justify-center flex ${this.isVisible ? '' : 'hidden'}`}>
          <div
            class={`emiya-tooltip-inner transition-all rounded flex mb-1 ${this.isVisible ? '' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: 'rgba(0,16,27,.7)' }}
          >
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
