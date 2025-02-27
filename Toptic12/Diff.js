/*
 * @Author: Diana Tang
 * @Date: 2025-02-27 18:21:17
 * @LastEditors: Diana Tang
 * @Description: 简化版 React Diff 算法核心思想
 * @FilePath: /FrontDevGraph/Toptic12/Diff.js
 */
/**
 * 简化版 React Diff 算法核心思想
 * @param {Array} oldList 旧的虚拟DOM列表
 * @param {Array} newList 新的虚拟DOM列表
 * @returns {Array} 操作指令数组
 */
function simpleDiff(oldList, newList) {
    const updates = [];
    
    // 找出需要更新的节点
    const minLen = Math.min(oldList.length, newList.length);
    
    for (let i = 0; i < minLen; i++) {
      if (oldList[i].key === newList[i].key) {
        if (oldList[i].props !== newList[i].props) {
          updates.push({
            type: 'UPDATE',
            oldNode: oldList[i],
            newNode: newList[i]
          });
        }
      } else {
        // key不同，需要替换
        updates.push({
          type: 'REPLACE',
          oldNode: oldList[i],
          newNode: newList[i]
        });
      }
    }
    
    // 处理新增的节点
    if (newList.length > oldList.length) {
      for (let i = oldList.length; i < newList.length; i++) {
        updates.push({
          type: 'ADD',
          newNode: newList[i]
        });
      }
    }
    
    // 处理删除的节点
    if (oldList.length > newList.length) {
      for (let i = newList.length; i < oldList.length; i++) {
        updates.push({
          type: 'REMOVE',
          oldNode: oldList[i]
        });
      }
    }
    
    return updates;
  }
  
  // 使用示例
  const oldVirtualDOM = [
    { key: 'a', props: { className: 'old' } },
    { key: 'b', props: { className: 'test' } }
  ];
  
  const newVirtualDOM = [
    { key: 'a', props: { className: 'new' } },
    { key: 'c', props: { className: 'test' } }
  ];
  
  const diffResults = simpleDiff(oldVirtualDOM, newVirtualDOM);
  console.log(diffResults);