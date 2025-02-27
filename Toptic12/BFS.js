/*
 * @Author: Diana Tang
 * @Date: 2025-02-27 18:12:02
 * @LastEditors: Diana Tang
 * @Description: 广度优先搜索遍历DOM树
 * @FilePath: /FrontDevGraph/Toptic12/BFS.js
 */
/**
 * 广度优先搜索遍历DOM树
 * @param {Node} startNode 起始节点
 * @param {Function} callback 对每个节点执行的回调函数
 */
function bfsTraversal(startNode, callback) {
    if (!startNode) return;
    
    const queue = [startNode];
    
    while (queue.length > 0) {
      const currentNode = queue.shift();
      
      // 处理当前节点
      callback(currentNode);
      
      // 将子节点加入队列
      const children = currentNode.children;
      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          queue.push(children[i]);
        }
      }
    }
  }
  
  // 使用示例
  bfsTraversal(document.body, node => {
    console.log(node.tagName);
    // 可以在这里执行DOM操作
  });