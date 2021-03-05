
const helper = {
  // 阻止ios移动端双击放大导致误触问题
  forbidIOSScale: () => {
    let touchTime = 0;
    document.addEventListener("touchstart", (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });
    document.addEventListener(
      "touchend",
      (e) => {
        // 记录当前点击的时间与下一次时间的间隔
        const nowTime = new Date();
        if (nowTime.getTime() - touchTime <= 300) {
          event.preventDefault();
        }
        touchTime = nowTime.getTime();
      }
    );
  },
};

helper.forbidIOSScale();