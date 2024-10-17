import { Component, h } from '@stencil/core';

@Component({
  tag: 'emiya-tooltip',
  styleUrl: 'emiya-tooltip.scss',
})
export class EmiyaTooltip {
  render() {
    return (
      <div class="emiya-tooltip-trigger contents relative">
        <div class="contents" onPointerEnter={a => alert(1)}>
          <slot name="trigger"></slot>
        </div>
        <div class="absolute left-[83px] top-[-30px]">83</div>
        <div class="emiya-tooltip absolute opacity-0">
          <slot></slot>
        </div>
      </div>
    );
  }
}
