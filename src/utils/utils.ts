export function isIphone() {
  return /iPhone/i.test(navigator.userAgent);
}

export function isMobile() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent) && window.screen.width < 640;
}

export function isWechat() {
  return navigator.userAgent.toUpperCase().includes('MicroMessenger'.toUpperCase()) || navigator.userAgent.toUpperCase().includes('Wechat'.toUpperCase());
}

export function format(first?: string, middle?: string, last?: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export const requestFullscreen = () => {
  const element: any = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
};

export function isFullScreen() {
  const doc = document as any;
  return !!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
}

//退出全屏方法
export const exitFullscreen = () => {
  const element: any = document;
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (element.msExitFullscreen) {
    element.msExitFullscreen();
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen();
  } else if (element.webkitCancelFullScreen) {
    element.webkitCancelFullScreen();
  } else if ((window.parent as any)['showTopBottom']) {
    (window.parent as any)['showTopBottom']();
  }
};
