/*
 * @Author: Diana Tang
 * @Date: 2025-02-27 17:55:01
 * @LastEditors: Diana Tang
 * @Description: some description
 * @FilePath: /FrontDevGraph/Toptic12/Debounce.js
 */
/**
 * 防抖函数 - 延迟执行函数直到停止触发一段时间后
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间(ms)
 * @returns {Function} 防抖处理后的函数
 */
function debounce(fn,delay){
    let timer=null;
    return function(...args){
        const context=this;
        clearTimeout(timer);
        timer=setTimeout(()=>{
            fn.apply(context,args);
        },delay);
    }
}
  
  // 使用示例
  const handleSearch = debounce(function(query) {
    console.log('Searching for:', query);
    // 执行搜索逻辑
  }, 300);
  
  // 在输入框中使用
  searchInput.addEventListener('input', e => handleSearch(e.target.value));