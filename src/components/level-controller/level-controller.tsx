import { Component, h, Prop, State } from '@stencil/core';
import { Level } from 'hls.js';
import quality from './assets/quality.svg';
import quality1 from './assets/quality1.svg';

@Component({
  tag: 'level-controller',
  styleUrl: 'level-controller.scss',
})
export class LevelController {
  @Prop() auto?: boolean;
  @Prop() value: number;
  @Prop() onChange: (value: number) => any;
  @Prop() options: { id: number; name: string; level?: Level }[] = [];

  tooltipRef: HTMLEmiyaTooltipElement;

  @State() isBarVisible = false;
  @State() currentLevel: number;

  onVisibilityChange(event: boolean) {
    this.isBarVisible = event;
  }

  get actualOptions() {
    return [
      {
        id: -1,
        name: '',
      },
      ...this.options,
    ];
  }

  render() {
    return (
      <emiya-tooltip
        onVisibilityChange={this.onVisibilityChange.bind(this)}
        class="h-full"
        ref={a => {
          this.tooltipRef = a;
        }}
      >
        <div slot="trigger" class="h-full min-w-[34px] flex items-center justify-center cursor-pointer">
          <img class="!h-[16px]" src={this.isBarVisible ? quality1 : quality}></img>
        </div>
        <div class="px-2 text-xs">
          {this.actualOptions.map(a => (
            <div
              key={a.id}
              style={{ color: (!this.auto && a.id === this.value) || (this.auto && a.id === -1) ? '#E12617' : '' }}
              class={`text-center my-2 cursor-pointer whitespace-nowrap`}
              onClick={() => {
                this.onChange && this.onChange(a.id);
                this.tooltipRef.setVisibility(false);
              }}
            >
              {a.id === -1 ? `自动${this.auto && this.options[this.value] ? `(${this.options[this.value].name})` : ''}` : a.name}
            </div>
          ))}
        </div>
      </emiya-tooltip>
    );
  }
}
