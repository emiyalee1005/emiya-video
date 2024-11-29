好的，我来帮你写一个清晰的使用文档：

```markdown:docs/usage.md
# Emiya Video 播放器使用文档

## 安装
```bash
npm install emiya-video
```

## 基础使用
```html
<emiya-video 
  id="emiya-video"
  src="视频ID"
  watermark="水印内容"
  seekable="true"
></emiya-video>
```
##### src: 视频ID
##### watermark: 是否可以拖拽进度
##### seekable: 水印内容

## 获取播放器实例
```typescript
const player = document.getElementById('emiya-video')
```

## 播放控制
### 播放/暂停
```typescript
// 播放视频
await player.play();

// 暂停视频
await player.pause();

// 停止视频, 反过来说src为空时表示当前状态为停止
player.src=undefined
```

### 播放进度
```typescript
// 监听播放进度变化
player.onCurrentTimeChange = (value: number) => {
  console.log('播放进度:', value);
}

// 跳转到指定时间(单位:秒)
await player.setCurrentTime(8.3)

// 获取当前播放进度
const value = await player.getCurrentTime();
```

### 播放状态
```typescript
// 监听播放状态变化
player.onStatusChange = (status: VideoStatus) => {
  console.log('播放状态:', status);
}

// 获取当前播放状态
const status = await player.getStatus();

// 播放状态类型定义
type VideoStatus = 
  | 'idle'     // 初始状态
  | 'loading'  // 加载中
  | 'loaded'   // 加载完成
  | 'canPlay'  // 可以播放
  | 'waiting'  // 等待中
  | 'play'     // 开始播放
  | 'playing'  // 播放中
  | 'paused'   // 已暂停
  | 'ended'    // 播放结束
  | 'error'    // 播放错误
```

## 视频信息
### 时长与进度
```typescript
// 获取视频总时长(秒)
const duration = await player.getDurationChange();

// 监听播放进度变化
player.onCurrentTimeChange = (time: number) => {
  console.log('当前播放时间:', time);
}

// 监听视频时长变化
player.onDurationChange = (duration: number) => {
  console.log('视频总时长:', duration);
}
```

## 音量控制
```typescript
// 设置音量(0-100)，静音时为0
await player.setVolume(88);

// 静音
await player.mute()

// 取消静音
await player.unmute()

// 获取当前音量
const volume = await player.getVolume();

// 监听音量变化
player.onVolumeChange = (volume: number) => {
  console.log('当前音量:', volume); //静音时为0
}
```

## 全屏控制
```typescript
// 进入/退出全屏
await player.setFullScreen(true);  // 进入全屏
await player.setFullScreen(false); // 退出全屏

// 获取当前全屏状态
const isFullScreen = await player.getFullScreen();

// 监听全屏状态变化
player.onFullScreenChange = (isFullScreen: boolean) => {
  console.log('全屏状态:', isFullScreen);
}
```

## 清晰度控制
```typescript
// 获取播放清晰度
await player.getLevel();

// 获取可用清晰度列表
await player.getLevels();

// 设置播放清晰度
await player.setLevel(levelIndex); //levelIndex为可用清晰度列表里的顺序号，例如0表示列表里第一个清晰度，而-1表示使用自动模式

// 监听清晰度变化
player.onLevelChange = (levelIndex: number) => {
  console.log('当前清晰度:', levelIndex);
}

// 监听可用清晰度列表变化
player.onLevelsChange = (levels: { id: number; name: string }[]) => {
  console.log('可用清晰度列表:', levels);
}
```

## 播放速度控制
```typescript
// 设置播放速度
await player.setPlaybackRate(1);

// 获取播放速度
await player.getPlaybackRate();

// 监听播放速度变化
player.onPlaybackRateChange = (rate: number) => {
  console.log('当前清晰度:', rate);
}
```

## 销毁浏览器
```typescript
//设计上无需手动销毁浏览器，只要<emiya-video/>标签从dom树移除后，就会自动销毁
```
