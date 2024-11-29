# Emiya Video 播放器SDK文档

## 安装
```bash
npm install emiya-video
```

## 准备工作
将loader和dist两个文件夹放到静态资源目录

## 基础使用
```html
<html>
  <head>
    <script type="module">
      import { defineCustomElements } from './loader/index.js'; //这里import路径请按实际路径修改
  
      defineCustomElements();
    </script>
  </head>
  
  <body>
  <emiya-video
    id="emiya-video"
    src="视频ID"
    watermark="水印内容"
    seekable="true"
  ></emiya-video>
  <script type="text/javascript">
    const player = document.getElementById('emiya-video')
    // ...
  </script>
  </body>
</html>
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

## 完整示例
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