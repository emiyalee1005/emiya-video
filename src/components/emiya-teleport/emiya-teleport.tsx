import { Component, Element, h, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'emiya-teleport',
  styleUrl: 'emiya-teleport.css',
  scoped: true,
})
export class EmiyaTeleport {
  @Prop() targetSelector?: string;

  @Element() el: HTMLElement;

  @State() placeholderRect: DOMRect | undefined;

  builtinContainerElement: HTMLElement;
  slotWrapperElement: HTMLElement;

  @Watch('targetSelector')
  onTargetChange(newValue: string | undefined, oldValue: string | undefined) {
    if (!oldValue) {
      this.builtinContainerElement.style.display = '';
      this.placeholderRect = this.builtinContainerElement.getBoundingClientRect();
    } else {
      this.builtinContainerElement.style.display = 'contents';
    }
    this.slotWrapperElement.isConnected && this.slotWrapperElement.remove();
    const hostEl = newValue ? document.querySelector(newValue) : this.builtinContainerElement;
    hostEl.appendChild(this.slotWrapperElement);
  }

  componentDidLoad() {
    this.onTargetChange(this.targetSelector, undefined);
  }

  get rootStyle() {
    return !this.targetSelector
      ? undefined
      : {
          width: `${this.placeholderRect?.width || 0}px`,
          height: `${this.placeholderRect?.height || 0}px`,
        };
  }

  render() {
    return (
      <div style={this.rootStyle} ref={el => (this.builtinContainerElement = el)}>
        <div class="contents" ref={el => (this.slotWrapperElement = el)}>
          <slot />
        </div>
      </div>
    );
  }
}
