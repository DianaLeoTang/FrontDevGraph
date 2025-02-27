/*
 * @Author: Diana Tang
 * @Date: 2025-02-27 18:09:39
 * @LastEditors: Diana Tang
 * @Description: 节流函数 - 限制函数在一定时间内只执行一次
 * @FilePath: /FrontDevGraph/Toptic12/Throttle.js
 */
/**
 * 节流函数 - 限制函数在一定时间内只执行一次
 * @param {Function} fn 要执行的函数
 * @param {number} limit 时间限制(ms)
 * @returns {Function} 节流处理后的函数
 */
function throttle(fn, limit) {
    let inThrottle = false;
    
    return function(...args) {
      const context = this;
      
      if (!inThrottle) {
        fn.apply(context, args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
  
  // 使用示例
  const handleScroll = throttle(function() {
    console.log('Scroll event throttled');
    // 执行滚动相关逻辑
  }, 200);
  
  // 在滚动事件中使用
  window.addEventListener('scroll', handleScroll);