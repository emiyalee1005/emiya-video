import { Component, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'emiya-tooltip',
  styleUrl: 'emiya-tooltip.scss',
})
export class EmiyaTooltip {
  @Prop() boundingElement?: HTMLElement | undefined;

  @State() onTriggerHovered: boolean = false;
  @State() onPopupHovered: boolean = false;

  render() {
    return (
      <div class="emiya-tooltip-trigger relative" onPointerEnter={() => (this.onTriggerHovered = true)} onPointerLeave={() => (this.onTriggerHovered = false)}>
        <slot name="trigger"></slot>
        <div
          class={`emiya-tooltip absolute left-0 bottom-[100%] w-full overflow-visible justify-center transition-all rounded-md flex ${this.onTriggerHovered ? '' : 'opacity-0 pointer-events-none'}`}
          style={{ backgroundColor: 'rgba(0,16,27,.7)' }}
        >
          <div class="emiya-tooltip-inner">
            <slot></slot>
          </div>
        </div>
      </div>
    );
  }
}
