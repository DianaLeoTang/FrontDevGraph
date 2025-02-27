# Vue.js 原理详细流程说明

## Vue 1.x 原理流程

### 第一步：初始化
- 创建 Vue 实例，接收配置参数
- 初始化生命周期、事件系统等

### 第二步：解析模板 (DocumentFragment)
- 使用 DocumentFragment 操作 DOM 节点
- 解析模板中的指令、插值表达式

### 第三步：处理指令 (Directive)
- 绑定 DOM 节点与指令
- 创建 Directive 实例处理不同的指令

### 第四步：数据观察 (Observer)
- 遍历数据对象的属性
- 将普通的 JavaScript 对象转换为响应式对象

### 第五步：设置 getter/setter
- 使用 Object.defineProperty 对数据进行劫持
- 为每个属性添加 getter 和 setter 方法

### 第六步：依赖收集 (Dep)
- 创建 Dep 对象作为订阅者管理中心
- 收集使用该数据的依赖关系

### 第七步：监听数据变化 (Watcher)
- 创建 Watcher 作为数据变化的订阅者
- 连接 Observer 和 Directive

### 第八步：更新 DOM
- 当数据变化时，Watcher 接收到通知
- 调用对应指令的 update 方法更新 DOM

## Vue 2.x 原理流程

### 初始化阶段

#### 第一步：初始化
- 创建 Vue 实例，接收配置参数
- 初始化生命周期、事件系统、渲染函数等
- 调用生命周期钩子：beforeCreate、created

#### 第二步：模板编译 (三个阶段)
1. **解析 (Parse)**：使用 HTML Parser 将模板字符串解析成 AST
   - 解析 HTML 标签、属性和内容
   - 构建 AST 元素节点 (type 为 1 表示元素，2 表示表达式，3 表示文本)

2. **优化 (Optimize)**：优化 AST
   - 标记静态节点 (static 属性)
   - 标记静态根节点 (staticRoot 属性)
   - 静态节点不需要在每次重新渲染时重新生成

3. **生成 (Generate)**：生成渲染函数代码
   - 将 AST 转换为 render 函数
   - render 函数用于创建虚拟 DOM

### 响应式系统构建

#### 第三步：数据响应式处理
- 使用 Object.defineProperty 对数据进行劫持
- Observer 类将普通对象转换为可观察对象
  - 遍历对象的所有属性
  - 递归处理嵌套对象

#### 第四步：依赖收集
- 创建 Dep 实例作为订阅中心
- 在 getter 中收集依赖 (Watcher)
- 建立数据和使用该数据的依赖之间的关系

#### 第五步：创建 Watcher
- Watcher 是观察者模式中的订阅者
- 连接 Observer 和视图更新
- 三种类型：渲染 Watcher、计算属性 Watcher、侦听器 Watcher

### 渲染与更新过程

#### 第六步：首次渲染
- 执行 render 函数生成虚拟 DOM (VNode)
- 虚拟 DOM 转换为真实 DOM 并插入到页面

#### 第七步：数据更新与重新渲染
1. 修改数据，触发 setter
2. setter 通知 Dep 中的所有 Watcher
3. Watcher 触发更新，执行 update 方法
4. 生成新的虚拟 DOM
5. 通过 Diff 算法比较新旧虚拟 DOM
6. 计算最小更新操作并应用到真实 DOM (patch 过程)最长递增子序列LIS算法

### Vue 2.x 性能优化

1. **静态树提升 (Hoisting Static Trees)**
   - 将静态内容提升到 render 函数之外
   - 只在初始化时创建一次，避免重复创建

2. **跳过静态绑定 (Skipping Static Bindings)**
   - 对于静态内容，不创建数据绑定
   - 减少不必要的响应式处理

3. **跳过子数组规范化 (Skipping Children Array Normalization)**
   - 对于确定不会改变结构的子节点，跳过数组规范化处理
   - 提高渲染性能

4. **服务器端渲染优化 (SSR Optimizations)**
   - 将 Virtual DOM 渲染函数转换为字符串连接
   - 推断异步组件
   - 内联关键 CSS