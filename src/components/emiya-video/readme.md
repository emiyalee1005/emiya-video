# my-component



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                 | Description | Type     | Default     |
| ---------------------- | ------------------------- | ----------- | -------- | ----------- |
| `autoHideControlDelay` | `auto-hide-control-delay` |             | `number` | `6000`      |
| `src`                  | `src`                     |             | `string` | `undefined` |


## Dependencies

### Depends on

- [emiya-teleport](../emiya-teleport)
- [emiya-watermark](../emiya-watermark)
- [emiya-video-progress-bar](../emiya-video-progress-bar)
- [level-controller](../level-controller)
- [volume-controller](../volume-controller)
- [playback-rate-controller](../playback-rate-controller)

### Graph
```mermaid
graph TD;
  emiya-video --> emiya-teleport
  emiya-video --> emiya-watermark
  emiya-video --> emiya-video-progress-bar
  emiya-video --> level-controller
  emiya-video --> volume-controller
  emiya-video --> playback-rate-controller
  emiya-video-progress-bar --> emiya-slider
  level-controller --> emiya-tooltip
  volume-controller --> emiya-tooltip
  volume-controller --> emiya-vertical-slider
  playback-rate-controller --> emiya-tooltip
  style emiya-video fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
