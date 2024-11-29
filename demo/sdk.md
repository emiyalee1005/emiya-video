# Emiya Video 播放器 SDK 文档

## 🚀 准备工作

将 `loader` 和 `dist` 两个文件夹放置到静态资源目录。

## 🎬 基础使用

### HTML 结构

```html
<html>
  <head>
    <script type="module">
      import { defineCustomElements } from './loader/index.js';
      defineCustomElements();
    </script>
  </head>
  
  <body>
    <emiya-video
      id="emiya-video"
      src="视频ID"
      watermark="水印内容"
      seekable="true"
      autoplay="false"
    ></emiya-video>

    <script type="text/javascript">
      const player = document.getElementById('emiya-video')
      // 播放器操作
    </script>
  </body>
</html>
```

#### 属性说明：
- `src`：视频 ID
- `watermark`：水印内容
- `seekable`：是否可以拖拽进度
- `autoplay`：是否自动播放（由于现代浏览器安全策略，如果用户一定时间没有与网页进行交互，那么自动播放功能是强制禁用的，因此这个功能不保证100%正常工作）
## 🎮 播放器控制

### 获取播放器实例

```typescript
const player = document.getElementById('emiya-video')
```

### 播放控制

#### 播放/暂停/停止

```typescript
// 播放视频
await player.play();

// 暂停视频
await player.pause();

// 停止视频（将 src 设为 undefined）
player.src = undefined
```

### 播放进度管理

```typescript
// 监听播放进度变化
player.onCurrentTimeChange = (value: number) => {
  console.log('播放进度:', value);
}

// 跳转到指定时间（单位：秒）
await player.setCurrentTime(8.3)

// 获取当前播放进度
const value = await player.getCurrentTime();
```

### 播放状态

#### 播放状态类型定义

```typescript
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

#### 状态监听和获取

```typescript
// 监听播放状态变化
player.onStatusChange = (status: VideoStatus) => {
  console.log('播放状态:', status);
}

// 获取当前播放状态
const status = await player.getStatus();
```

## 🎚️ 高级功能

### 视频信息

```typescript
// 获取视频总时长（秒）
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

### 音量控制

```typescript
// 设置音量（0-100）
await player.setVolume(88);

// 静音和取消静音
await player.mute()
await player.unmute()

// 获取当前音量
const volume = await player.getVolume();

// 监听音量变化
player.onVolumeChange = (volume: number) => {
  console.log('当前音量:', volume);
}
```

### 全屏控制

```typescript
// 全屏切换
await player.setFullScreen(true);  // 进入全屏
await player.setFullScreen(false); // 退出全屏

// 获取和监听全屏状态
const isFullScreen = await player.getFullScreen();
player.onFullScreenChange = (isFullScreen: boolean) => {
  console.log('全屏状态:', isFullScreen);
}
```

### 清晰度控制

```typescript
// 清晰度管理
await player.getLevel();
await player.getLevels();
await player.setLevel(levelIndex);

// 监听清晰度变化
player.onLevelChange = (levelIndex: number) => {
  console.log('当前清晰度:', levelIndex);
}
player.onLevelsChange = (levels: { id: number; name: string }[]) => {
  console.log('可用清晰度列表:', levels);
}
```

### 播放速度控制

```typescript
// 调整播放速度
await player.setPlaybackRate(1);
await player.getPlaybackRate();

// 监听播放速度变化
player.onPlaybackRateChange = (rate: number) => {
  console.log('当前播放速度:', rate);
}
```

## 📛 组件销毁

> 无需手动销毁浏览器，标签从 DOM 树移除后会自动销毁

## 🔍 完整示例

```html
<!doctype html>
<html dir="ltr" lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
  <title>Emiya Video</title>

  <script type="module">
    import { defineCustomElements } from './loader/index.js';

    defineCustomElements();
  </script>
</head>
<body>
<emiya-video class="emiya-video" style="width: 80%; height: 380px; margin: 10%" id="video" watermark="EMIYA" seekable="true" src="888" onStatusChange="onStatusChange" />
<button onclick="play()">播放</button>
<button onclick="pause()">暂停</button>
<button onclick="stop()">停止</button>
<button onclick="destroy()">销毁</button>
<button onclick="changeVideo()">更换视频</button>
<button onclick="getStatus()">获取当前状态</button>
<button onclick="getLevels()">获取清晰度列表</button>
<button onclick="getLevel()">获取当前清晰度</button>
<button onclick="setLevel()">设置清晰度</button>
<button onclick="getVolume()">获取音量</button>
<button onclick="setVolume()">设置音量</button>
<button onclick="mute()">静音</button>
<button onclick="unmute()">取消静音</button>
<button onclick="getFullScreen()">获取全屏状态</button>
<button onclick="setFullScreen()">全屏开关</button>
<button onclick="getPlaybackRate()">获取倍速</button>
<button onclick="setPlaybackRate()">设置倍速</button>
<button onclick="getDuration()">获取时长</button>
<button onclick="getCurrentTime()">获取当前播放时间</button>
<button onclick="setCurrentTime()">设置当前播放时间</button>
<script type="text/javascript">
  let player = document.getElementById('video');
  async function play() {
    await player.play();
  }
  async function pause() {
    await player.pause();
  }
  function stop() {
    player.src = undefined;
  }
  function destroy() {
    player.remove();
    player = undefined;
    alert(`已销毁，如需重新生成播放器请刷新页面`);
  }
  function changeVideo() {
    player.src = player.src === '888' ? 'http://playertest.longtailvideo.com/adaptive/bipbop/gear4/prog_index.m3u8' : '888'; //正常是传视频ID，但是这里为了测试方便，也可以直接传url
  }
  async function getStatus() {
    alert(await player.getStatus());
  }
  async function getLevels() {
    console.log(await player.getLevels());
  }
  async function getLevel() {
    alert(await player.getLevel());
  }
  async function getVolume() {
    alert(await player.getVolume());
  }
  async function getFullScreen() {
    alert(await player.getFullScreen());
  }
  async function setLevel() {
    await player.setLevel(1);
  }
  async function setVolume() {
    await player.setVolume(80);
  }
  async function mute() {
    await player.mute();
  }
  async function unmute() {
    await player.unmute();
  }
  async function setFullScreen() {
    await player.setFullScreen(!(await player.getFullScreen()));
  }
  async function getPlaybackRate() {
    alert(await player.getPlaybackRate());
  }
  async function setPlaybackRate() {
    await player.setPlaybackRate(2);
  }
  async function getDuration() {
    alert(await player.getDuration());
  }
  async function getCurrentTime() {
    alert(await player.getCurrentTime());
  }
  async function setCurrentTime() {
    await player.setCurrentTime(3.8);
  }
  player.onFullScreenChange = function (value) {
    console.log('是否全屏', value);
  };
  player.onVolumeChange = function (value) {
    console.log('音量', value);
  };
  player.onLevelChange = function (value) {
    console.log('当前清晰度', value);
  };
  player.onLevelsChange = function (value) {
    console.log('清晰度列表', value);
  };
  player.onStatusChange = function (status) {
    console.log('播放状态', status);
  };
  player.onPlaybackRateChange = function (rate) {
    console.log('播放速度', rate);
  };
  player.onDurationChange = function (value) {
    console.log('总时长', value);
  };
  player.onCurrentTimeChange = function (value) {
    console.log('当前播放时间', value);
  };
</script>
</body>
</html>

```

# 🗃️ OssHelper API 文档

## 📝 类初始化

```typescript
constructor(options: OssUploader.ConstructionOptions)
```

### 🔧 参数选项

| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `apiBaseUrl` | `string?` | API 基础 URL | - |
| `chunkSize` | `number?` | 分片大小 | `5MB` |
| `concurrency` | `number?` | 并发上传数 | `4` |
| `chunkFailureRetry` | `number?` | 分片上传失败重试次数 | `3` |

## 🚀 公共方法

### 📤 上传视频

```typescript
async upload(options: OssUploader.UploadOptions): Promise<string>
```

#### 🔍 参数详情

| 参数 | 类型 | 描述 | 必填 |
|------|------|------|------|
| `options.file` | `File \| Blob` | 要上传的文件 | 是 |
| `options.filename` | `string?` | 文件名 | 否 |
| `options.onProgress` | `(event) => any` | 上传进度回调函数 | 是 |

#### 📊 进度事件属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `totalSize` | `number` | 文件总大小 |
| `uploadedSize` | `number` | 已上传大小 |
| `totalChunkCount` | `number` | 总分片数 |
| `uploadedChunkCount` | `number` | 已上传分片数 |
| `uploadedChunks` | `number[]` | 已上传分片序号列表 |

#### 🔙 返回值
- `Promise<string>` - 返回视频 ID

### 🔗 获取视频 URL

```typescript
async getUrl(options: { videoId: string }): Promise<string>
```

#### 🔍 参数
- `options.videoId: string` - 视频 ID

#### 🔙 返回值
- `Promise<string>` - 返回视频播放 URL

### ⏱️ 获取视频时长

```typescript
async getVideoDuration(options: { videoId: string }): Promise<number>
```

#### 🔍 参数
- `options.videoId: string` - 视频 ID

#### 🔙 返回值
- `Promise<number>` - 返回视频时长（秒）

## 🧩 使用示例

```typescript
// 初始化 OssHelper
const ossHelper = new OssHelper({
  apiBaseUrl: 'https://api.example.com',
  chunkSize: 5 * 1024 * 1024, // 5MB
  concurrency: 4,
  chunkFailureRetry: 3
});

// 上传视频
const videoId = await ossHelper.upload({
  file: videoFile,
  filename: 'example.mp4',
  onProgress: (event) => {
    // 实时显示上传进度
    const progressPercentage = (event.uploadedSize / event.totalSize * 100).toFixed(2);
    console.log(`上传进度：${progressPercentage}%`);
  }
});

// 获取视频 URL
const url = await ossHelper.getUrl({ videoId });

// 获取视频时长
const duration = await ossHelper.getVideoDuration({ videoId });

console.log('视频 ID:', videoId);
console.log('视频 URL:', url);
console.log('视频时长:', duration);
```