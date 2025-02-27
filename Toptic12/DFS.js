/*
 * @Author: Diana Tang
 * @Date: 2025-02-27 18:10:25
 * @LastEditors: Diana Tang
 * @Description: 深度优先搜索遍历DOM树
 * @FilePath: /FrontDevGraph/Toptic12/DFS.js
 */
/**
 * 深度优先搜索遍历DOM树
 * @param {Node} node 起始节点
 * @param {Function} callback 对每个节点执行的回调函数
 */
function dfsTraversal(node, callback) {
    if (!node) return;
    
    // 处理当前节点
    callback(node);
    
    // 递归处理子节点
    const children = node.children;
    if (children && children.length) {
      for (let i = 0; i < children.length; i++) {
        dfsTraversal(children[i], callback);
      }
    }
  }
  
  // 使用示例
  dfsTraversal(document.body, node => {
    console.log(node.tagName);
    // 可以在这里执行DOM操作
  });