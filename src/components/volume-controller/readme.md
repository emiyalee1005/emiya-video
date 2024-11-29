# volume-controller



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute     | Description | Type                     | Default     |
| ----------- | ------------- | ----------- | ------------------------ | ----------- |
| `onChange`  | --            |             | `(value: number) => any` | `undefined` |
| `reverseXY` | `reverse-x-y` |             | `boolean`                | `undefined` |
| `videoRef`  | --            |             | `HTMLVideoElement`       | `undefined` |


## Dependencies

### Used by

 - [emiya-video](../emiya-video)

### Depends on

- [emiya-tooltip](../emiya-tooltip)
- [emiya-vertical-slider](../emiya-vertical-slider)

### Graph
```mermaid
graph TD;
  volume-controller --> emiya-tooltip
  volume-controller --> emiya-vertical-slider
  emiya-video --> volume-controller
  style volume-controller fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
