# my-component



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `src`    | `src`     |             | `string` | `undefined` |


## Dependencies

### Depends on

- [emiya-teleport](../emiya-teleport)
- [emiya-video-progress-bar](../emiya-video-progress-bar)
- [level-controller](../level-controller)
- [volume-controller](../volume-controller)

### Graph
```mermaid
graph TD;
  emiya-video --> emiya-teleport
  emiya-video --> emiya-video-progress-bar
  emiya-video --> level-controller
  emiya-video --> volume-controller
  emiya-video-progress-bar --> emiya-slider
  level-controller --> emiya-tooltip
  volume-controller --> emiya-tooltip
  volume-controller --> emiya-vertical-slider
  style emiya-video fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
