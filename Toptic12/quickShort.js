/*
 * @Author: Diana Tang
 * @Date: 2025-02-27 18:18:04
 * @LastEditors: Diana Tang
 * @Description: some description
 * @FilePath: /FrontDevGraph/Toptic12/quickShort.js
 */
/**
 * 快速排序算法
 * @param {Array} arr 要排序的数组
 * @returns {Array} 排序后的新数组
 */
function quickSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...quickSort(left), ...middle, ...quickSort(right)];
  }
  
  // 使用示例
  const sortedArray = quickSort([5, 3, 7, 1, 8, 2, 4]);
  console.log(sortedArray); // [1, 2, 3, 4, 5, 7, 8]