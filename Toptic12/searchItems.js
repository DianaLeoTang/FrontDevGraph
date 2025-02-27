/*
 * @Author: Diana Tang
 * @Date: 2025-02-27 18:19:03
 * @LastEditors: Diana Tang
 * @Description: 简单的字符串模式匹配
 * @FilePath: /FrontDevGraph/Toptic12/searchItems.js
 */
/**
 * 简单的字符串模式匹配 (忽略大小写)
 * @param {Array} items 要搜索的项目数组
 * @param {string} query 搜索关键词
 * @param {string} field 要在项目中搜索的字段
 * @returns {Array} 匹配的项目数组
 */
function searchItems(items, query, field) {
    if (!query) return items;
    
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => {
      if (!item[field]) return false;
      return item[field].toLowerCase().includes(lowerQuery);
    });
  }
  
  // 使用示例
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' }
  ];
  
  const results = searchItems(users, '张', 'name');
  console.log(results); // [{ id: 1, name: '张三', email: 'zhangsan@example.com' }]