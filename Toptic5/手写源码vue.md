<!--
 * @Author: Diana Tang
 * @Date: 2025-02-25 17:46:10
 * @LastEditors: Diana Tang
 * @Description: some description
 * @FilePath: /FrontDevGraph/Toptic5/手写源码vue.md
-->
# 手写源码系列——Vue1.x

## 零、写在前面
之前的GitHub账号出了一些问题，导致对应的手写源码内容就丢了，好在本地还有，就迁移到这里，也相当于在此回顾Vue的发展历程了。我们会从Vue1写起，vue迭代的过程，其实也是在修复框架自身的问题和发展自己的生态。Vue1 的核心原理是Object.defineProperty()和发布订阅模式。Vue2和Vue1的根本区别是虚拟DOM的引入，即VNode和Patch算法，也就是V DOM和Diff算法。这些共同构成了Vue的数据响应式。但显然的，Object.defineProperty 本身的局限性一直存在，无法直接监听数组，无法监听新增和删除的属性，为了解决这个问题，Vue3里面进行了断崖式版本更新，启用 Proxy。

**让我们带着这些问题继续阅读，我相信会收获很多。**



## 一、new Vue(options)——Vue的初始化

我们在面试的时候，谈到Vue的时候一个老生常谈的问题就是，`new Vue的时候发生了什么？`这个面试题我们在这里就可以找到答案。我们在不适用Vue-cli构建项目的时候通常会直接在页面中引入`vue.js`文件，然后我们就会new Vue(options)。在Vue源码中new Vue做了什么？我们先来看代码：

```javascript
// src/index.js
export default function Vue(options) {
  this._init(options);
}
```

我们会发现所谓的Vue构造函数竟然只有一行代码，就是执行了一个this._init(options)方法。从方法名我们可以判断出来，`this._init`方法主要的任务就是对于Vue进行初始化操作：

```javascript
// src/index.js
export default function Vue(options) {
  this._init(options);
}

Vue.prototype._init = function(options) {
  this.options = options;
  // 数据响应式
  initData(this);
  // 模板编译和挂载
  if(this.options.el) {
    this.$mount()
  }
}

Vue.prototype.$mount = function() {
  mount(this);
}
```

Vue的初始化其实就做了两件事：

+ 数据的响应式处理
+ 模板的编译和挂载



## 二、数据的响应式处理——initData函数

initData函数接收了Vue实例，并对Vue实例上的data数据进行了响应式处理：

```javascript
// src/initData.js
import proxy from './proxy.js';
import observe from './observe.js';

export default function initData(vm) {
  const { data } = vm.$options;
  
  if(!data) {
    vm._data = {};
  }else {
    vm._data = typeof data === 'function'? data(): data;
  }
  
  // 做一层代理
  for(const key in data) {
    proxy(vm, '_data', key)
	}
  
  // 数据响应式处理的入口
  observe(vm._data);
}
```

initData函数的实现的是data对象的获取，要判断data是函数还是对象，如果是函数那么直接执行，如果是对象直接赋值。以及data对象中属性的代理，即把`this._data`对象中的属性代理到`this`实例上。这个代理的工作由`proxy`函数完成：

```javascript
// src/proxy.js

export default function proxy(vm, sourceKey, key) {
  // vm.xxx ----> vm._data.xxx
  Object.defineProperty(vm, key {
  	get() {
    	return vm[sourceKey][key];
  	},
    set(newVal) {
      vm[sourceKey][key] = newVal;
    }
  });
}
```

代理完成之后，我们就可以对于`vm._data`上的属性进行响应式处理了。



**observe函数：**

```javascript
// src/observe.js
import Observer from './Observer.js';

export default function observe(value) {
  if(typeof value !== 'object') return;
  if(value.__ob__) return value.__ob__;
  
  return new Observer(value)
}
```

observe函数干了下面这几件事：

+ 检查value是否值为类型，如果值为类型则直接返回，终止程序。
+ 检查value是否带有`__ob__`属性，如果有则直接返回该属性。
+ 两项检查都不符合，直接进行`new Observer`操作，对value进行响应式处理，并返回响应式对象。



**Observer类（构造函数）：**

```javascript
// src/Observer.js
import protoArgument from './protoArgument.js'

export default Observer(value) {
  // 这里给value绑定__ob__是为了数组的响应式，依赖的收集和更新
  Object.defineProperty(value, '__ob__', {
    value: this,
    configurable: true,
    // 如果为true造成无限递归
    enumerable: false,
    writable: true
  });
  if(Array.isArray(value)) {
    // 数组的响应式处理
    protoArgument(value)
    this.observeArray(value);
  }else {
    // 对象的响应式处理
    this.walk(value)
  }
}

Observer.prototype.walk = function(obj) {
  for(const key in obj) {
    defineReactive(obj, key, obj[key]);
  }
}

Observer.prototype.observeArray = function(value) {
  for(const item of value) {
    observe(item);
  }
}
```



**defineReactive**

```javascript
// src/defineReactive.js

export default function defineReactive(obj, key, value) {
  // 处理value可能为对象的情况
  observe(value);
  // obj中的每个key做响应式处理
  Object.defineProperty(obj, key, {
    get() {
      console.log(`getter key = ${key}`);
      return value;
    },
    set(newVal) {
      console.log(`setter ${key}: ${value}`);
      if(newVal === value) return;
      value = newVal;
      // 处理新赋的值可能为对象的情况
      observe(value);
    }
  });
}
```

这一段代码是对象响应式的核心，让`obj[key]`通过Object.defineProperty的处理，在getter和setter函数的帮助下，我们就能准确的得知`obj[key]`的读写操作，从而可以实现响应式。



**数组的响应式处理**

```javascript
// src/protoArgument.js

const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const methodsPatch = ['push', 'pop', 'unshift', 'shift', 'split', 'reverse', 'sort'];

methodsPatch.forEach(method => {
  Object.defineProperty(arrayMethods, method, {
    value: function(...args) {
      const result = arrayProto[method]apply(this, args);
      console.log('数组的响应式处理...');
      let inserted;
      switch(method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'split':
          inserted = args.slice(2);
          break;
      }
      
      if(inserted) {
        this.observeArray(inserted)
      }
      return result;
    }
  })
});

export default function protoArgument(value) {
  // 更改数组的原型
  value.__proto__ = arrayMethods;
}
```

数组的响应式做了以下几件事：

+ 监听了七种可以改变原数组的方法。
+ 更换了数组的原型。

这里的重点就在于数组的响应式是利用数组的原型为参数，创造了一个对象（arrayMethods）。然后拦截了七个改变数组的方法，把这七个方法设置到新创建的对象上，并且把新创建的对象更换为数组的原型。

这段代码的难点在于this的指向问题，这段代码中的this实际上是我们在Vue中常用到的`this.arr`，而并不是Vue实例。这样当我们在代码中编写`this.arr.push`这种代码的时候，就会触发arrayMethods对象上的push函数，我们就得知了数组的 变化。这么做的根本原因是数组的监听不太适合使用Object.defineProperty方法。

> **注意这里笔者说的意思是不太适合，并不是Object.defineProperty不能监听数组，而是如果使用Object.defineProperty来监听数组会带来很大的性能问题！**
>
> 关于这个问题，网上很多帖子说Object.defineProperty不能监听数组，这是大错特错的。



至此为止我们把对象和数组的响应式处理全部介绍完了。那么我们现在想一个问题，数据的响应式实现了，**怎么才能通过数据的改变完成视图的改变呢？**

要想解决这个问题，我们需要先思考三个问题：

+ 什么是视图？

+ 怎么改变视图？
+ 谁改变了视图？

第一个问题很好想，在web领域中，视图就是一些DOM元素所组成的显示在网页上的内容。

第二个问题，改变视图的方式无非是使用JS进行DOM操作。

第三个问题，至于是谁改变了视图，一定是有一个方法执行了改变了视图。这个方法在谁那儿，谁就改变了视图，这个**“谁”**就是watcher对象。

我们再思考一个问题：**什么时候更新视图？**

这个问题也很简单，数据发生改变之后我们立即更改视图。

最后一个问题：**我们怎么能得知应该更新那个视图？**

这就引出了一个重要的概念——**依赖**，我们在视图中改变的是那些变化的dom结构，只有用到了响应式数据的dom结构才有可能发生变化，所以我们就说这个视图依赖了响应式数据。即响应式数据是dom结构的依赖。dom结构的更新也就是依赖的更新。我们更改的是含有依赖的dom结构，所以我们要在一个时机把这些依赖收集起来。以便在数据发生改变的时候更改视图，更改视图的动作我们叫做通知依赖更新。那么我们在什么时候收集依赖呢？

**显然的，我们要在读取数据的时候收集依赖，在数据改变的时候通知依赖。**

我们要收集依赖和通知依赖更新需要有两个类：

+ Dep
+ Watcher

Dep是依赖的收集和通知，Watcher是改变dom结构的实体。直接看代码：



**Dep**

```javascript
// src/dep.js

export default function Dep() {
  this.watchers = [];
}

// 依赖收集
Dep.prototype.depend = function() {
  // 防止重复收集依赖
  if(this.watchers.includes(Dep.target)) return; 
  this.watcher.push(Dep.target);
}

// 通知更新
Dep.prototype.notify = function() {
  for(const watcher of this.watchers) {
    watcher.update();
  }
}
```

Dep做了两件事：

+ 收集依赖（Dep.target会在Watcher实例化的时候被赋值）
+ 通知依赖更新



**Watcher**

```javascript
// src/watcher.js
import Dep from './dep.js'

export default function Watcher(cb) {
  // watcher带一个回调函数，这个回调函数就是上文说到了改变视图的函数。
  this._cb = cb;
  Dep.target = this;
  // 执行回调函数的时候会触发响应式数据的getter操作，重新收集依赖。
  this._cb();
  // 依赖置空
  Dep.target = null;
}

Watcher.prototype.update = function() {
  this._cb();
}
```

Watcher带有一个回调函数，这个回调函数就是实现dom改变的，Watcher就是改变视图的实体。



到现在为止，我们有了依赖通知和更新所需的所有的实体（Dep、Watcher）。下面我们就开始改造数据响应式的代码，使数据响应式和依赖的通知和更新结合起来，产生关系：

**整个对象的依赖收集**

```javascript
// Observer.js
// src/Observer.js
import protoArgument from './protoArgument.js'
import observe from './observe.js'
import defineReactive from './defineReactive.js'
import Dep from './dep.js'

export default Observer(value) {
  // 这里给value绑定__ob__是为了数组的响应式，依赖的收集和更新
  Object.defineProperty(value, '__ob__', {
    value: this,
    configurable: true,
    // 如果为true造成无限递归
    enumerable: false,
    writable: true
  });
  if(Array.isArray(value)) {
    // 数组的响应式处理
    protoArgument(value)
    this.observeArray(value);
  }else {
    // 对象的响应式处理
    this.walk(value)
  }
}

// 整个对象、数组的依赖收集和更新
value.__ob__.dep = new Dep();

Observer.prototype.walk = function(obj) {
  for(const key in obj) {
    defineReactive(obj, key, obj[key]);
  }
}

Observer.prototype.observeArray = function(value) {
  for(const item of value) {
    observe(item);
  }
}
```

**对象中每个项的依赖收集和更新**

```javascript
// src/defineReactive.js
import Dep from './dep.js'
import observe from './observe.js'

export default function defineReactive(obj, key, value) {
  // 处理value可能为对象的情况
  const childOb = observe(value);
  const dep = new Dep();
  // obj中的每个key做响应式处理
  Object.defineProperty(obj, key, {
    get() {
      console.log(`getter key = ${key}`);
      if(Dep.target) {
        dep.depend();
        if(childOb) {
          childOb.dep.depend();
        }
      }
      return value;
    },
    set(newVal) {
      console.log(`setter ${key}: ${value}`);
      if(newVal === value) return;
      value = newVal;
      // 处理新赋的值可能为对象的情况
      observe(value);
      dep.notify();
    }
  });
}
```

**数组中依赖收集和更新**

```javascript
// src/protoArgument.js

const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const methodsPatch = ['push', 'pop', 'unshift', 'shift', 'split', 'reverse', 'sort'];

methodsPatch.forEach(method => {
  Object.defineProperty(arrayMethods, method, {
    value: function(...args) {
      const result = arrayProto[method]apply(this, args);
      console.log('数组的响应式处理...');
      let inserted;
      switch(method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'split':
          inserted = args.slice(2);
          break;
      }
      if(inserted) {
        this.__ob__.observeArray(inserted)
      }
      this.__ob__.notify();
      return result;
    }
  })
});

export default function protoArgument(value) {
  // 更改数组的原型
  value.__proto__ = arrayMethods;
}
```



**我们已经取得了阶段性的成果，数据响应式和依赖的通知和更新都已经完成了。接下来就是模板的编译，配合依赖的收集和更新实现视图的更新！**



## 三、模板编译

在new Vue中的_init方法中调用了this.$mount方法，这个方法中调用了mount方法，mount方法就是模板编译的入口。

```javascript
// src/index.js
export default function Vue(options) {
  this._init(options);
}

Vue.prototype._init = function(options) {
  this.options = options;
  // 数据响应式
  initData(this);
  // 模板编译和挂载
  if(this.options.el) {
    this.$mount()
  }
}

Vue.prototype.$mount = function() {
  mount(this);
}
```

我们可以看到在代码中当有el选项的时候我们执行模板编译。

```javascript
// src/compile/index.js
import compileNodes from './compileNodes.js';

export default function mount(vm) {
  let { el } = vm.$options;
  
  el = document.querySelector(el);
  
  compileNodes(Array.from(el.childNodes), vm);
}
```

模板的编译实际上是对于el选项中指定的dom结构，选中DOM结构之后，调用compileNodes函数进行模板编译。

**compileNodes**

```javascript
// src/compiler/compileNodes.js
import compileAttributes from './compileAttributes.js';
import compileTextNode from './compileTextNode.js';

export default function compileNodes(nodes, vm) {
  for(const node of nodes) {
    if(node.nodeType === 1) {
      // node为元素类型
      compileAttributes(node, vm);
     	// node递归解析
      compileNodes(Array.from(node.childNodes), vm);
    }else if(node.nodeType === 3 && node.textContent.match(/{{(.*)}}/)) {
      // node为文本节点，并且含有插值表达式语法{{ xxx }}
      compileTextNode(node, vm);
    }
  }
}
```

compileNodes函数做了三件事：

+ node为元素类型时，解析属性。
+ node为元素类型时，递归解析node.childNodes。
+ node为文本节点时，解析文本节点。

**compileAttributes**

```javascript
import Watcher from '../watcher.js';

export default function compileAttributes(node, vm) {
  const attrs = node.aattributes;
  for(const attr of attrs) {
    let { name, value } = attr;
    
    if(name.match(/v-bind:(.*)/)) {
      // <div v-bind:class='key'></div>
      compileVBind(node, value, vm);
    }else if(name.match(/v-on:click/)) {
      // <div v-on:click='clickHandle'></div>
      compileVOnClick(node, value, vm);
    }else if(name.match(/v-model/)) {
      compileVModel(node, value, vm);
    }
  }
}

function compileVBind(node, key, vm) {
  const attrName = RegExp.$1;
  // 移除v-bind属性
  node.removeAttribute(`v-bind:${attrName}`);
  
  function cb() {
    node.setAttribute(attrName, vm[attrValue]);
  }
  new Watcher(cb);
}

function compileVOnClick(node, method, vm) {
  node.addEventListener(function(...args) {
    vm.$options.methods[method].apply(vm, args);
  })
}

function compileVModel(node, key, vm) {
  let { tagName, type } = node;
  tagName = tagName.toLowerCase();
  if(tagName === 'input' && type === 'text') {
    node.value = vm[key];

    node.addEventListener('input', function() {
      vm[key] = node.value;
    })
  }else if(tagName === 'input' && type === 'checkbox') {
    node.checked = vm[key];

    node.addEventListener('change', function() {
      vm[key] = node.checked;
    })
  }else if(tagName === 'select') {
    node.value = vm[key];

    node.addEventListener('change', function() {
      vm[key] = node.value;
    })
  }
}
```

**compileTextNode**

```javascript
import Watcher from '../watcher.js';

export default function compileTextNode(node, vm) {
  const key = RegExp.$1.trim();

  function cb() {
    const value = vm[key];
    node.textContent = typeof value === 'object'? JSON.stringify(value): String(value);
  }

  new Watcher(cb)
}
```



在Watcher中的cb中会触发getter函数，完成重新的依赖收集。



## 四、总结

Vue1.0的源码比较简单，只是实现了数据响应式、依赖收集更新、模板编译。我们从源码中可以看出Vue1.0是一个响应式数据一个watcher，这样的设计在做一些小型项目的时候效率会很高，但是大型项目watcher的数量会急剧增加，影响性能。Vue2为了解决这个问题引入了Vnode和patch算法。


# Vue2原理分析（一）



## 零、写在前面

**我们为什么要学习源码？**

作为一个IT从业人员，无论前端还是后端干的时间越久就会发现前后端的界限其实并不是那么明显，计算机的本质就是数据结构加算法，我们作为前端开发者很容易成为一个或者多个框架的熟练使用者，这是没有优势的。我们的基本功在于对数据结构和算法的掌握。这种功力的训练的一个重要的锻炼方法就是阅读优秀的源码，学习源码背后的原理，以及优秀的开源风格的设计思路。这才能真正的提高我们的编码功底。

**学习源码对于我们的意义？**

+ 面试：现在的前端面试，源码的面试是必须的，看得懂源码甚至手写源码都是我们必备的技能。只有这样才能更好的过面试，才能多赚钱。
+ 工作：我们平时在工作的时候会遇到有关于框架的一些奇怪的错误，这时候如果我们只是一个框架的熟练使用者，对框架的源码以及原理都不熟悉就很难快速精准的定位问题并解决问题。

**框架的源码应该怎么学？**

学习框架的源码不是为了学习源码而学习源码，我们要重点掌握的是以下几点：

+ Vue2源码的目录架构
+ 双向数据绑定&SetState原理
+ Vue2 Virtual-dom
+ Vue2 DOM Diff算法解析
+ Vue2整体解析流程
+ Vue运行时优化
+ 再见Vue~前端技术框架选型



## 一、Vue2源码的目录架构

.
├── BACKERS.md  
├── LICENSE  
├── README.md  
├── benchmarks  
├── dist  
├── examples  
├── flow  
├── package.json  
├── packages  
├── scripts  
├── src  
├── test  
├── types  
└── yarn.lock  

这是Vue2的整体的目录，我们挑重点的说一下：

+ benchmarks：Vue的跑分目录
+ dist：打包好的Vue文件存放在dist里面，里面有各种打包方式打包后的vue。
+ examples：VueJS的使用范例。
+ flow：VueJS使用的类型检查工具，由facebook开发。现在已经停止维护了。
+ packages：编译器文件目录。
+ scripts：VueJS打包的脚本文件目录。
+ src：Vue的源码文件目录。
+ test：单元测试文件目录。
+ types：VueJS的类型声明文件目录。

既然是源码分析，我们的重点就在于**src目录**，让我们先来看一下src目录中的结构：

```text
src
├── compiler        # 编译相关 
├── core            # 核心代码 
├── platforms       # 不同平台的支持
├── server          # 服务端渲染
├── sfc             # .vue 文件解析
├── shared          # 共享代码
```

### 目录总结

```
├── benchmarks                  性能、基准测试
├── dist                        构建打包的输出目录
├── examples                    案例目录
├── flow                        flow 语法的类型声明
├── packages                    一些额外的包，比如：负责服务端渲染的包 vue-server-renderer、配合 vue-loader 使用的vue-template-compiler，还有 weex 相关的
│   ├── vue-server-renderer
│   ├── vue-template-compiler
│   ├── weex-template-compiler
│   └── weex-vue-framework
├── scripts                     所有的配置文件的存放位置，比如 rollup 的配置文件
├── src                         vue 源码目录
│   ├── compiler                编译器
│   ├── core                    运行时的核心包
│   │   ├── components          全局组件，比如 keep-alive
│   │   ├── config.js           一些默认配置项
│   │   ├── global-api          全局 API，比如熟悉的：Vue.use()、Vue.component() 等
│   │   ├── instance            Vue 实例相关的，比如 Vue 构造函数就在这个目录下
│   │   ├── observer            响应式原理
│   │   ├── util                工具方法
│   │   └── vdom                虚拟 DOM 相关，比如熟悉的 patch 算法就在这儿
│   ├── platforms               平台相关的编译器代码
│   │   ├── web
│   │   └── weex
│   ├── server                  服务端渲染相关
├── test                        测试目录
├── types                       TS 类型声明

```

### compiler

这个目录中包含的全部是Vue有关于代码编译的相关代码。包括把代码编译成AST语法树，AST的优化等等。有关于Vue的编译分为两种，一种是离线编译，一种是在线编译。

+ 离线编译：我们平时使用vue-cli生成的vue项目，使用的是**vue.runtime.js**，顾名思义是运行时的VueJS。这种VueJS是不带编译器的，把编译的工作交给webpack和vue-loader来做，也就是说在构建的时候做编译的工作。
+ 在线编译：VueJS也有一种带编译器的，既我们在html文件中引入的vue文件就是带编译器的，这种就是在线编译的方式。

要注意的是编译是一个很耗费时间的工作，所以建议使用离线编译的方式。

### core

这个目录中是Vue的核心代码，可谓是重中之重，是要重点分析的部分。它包括内置组件、全局API、Vue的实例化、观察者、虚拟Dom、工具函数等。

core是Vue源码的核心，一定要掌握！

### platform

Vue是个跨平台的框架，可以支持web和weex端，我们则主要研究web端的VueJS。

### server

现在Vue支持SSR服务端渲染，所有与服务端渲染相关的代码都在这个目录下面。SSR主要工作就是把服务端的VueJS代码编译成html压面返回给浏览器。

### sfc

通常我们在开发Vue项目的时候都会借助webpack打包，然后使用.vue文件来编写组件，这种方式就是sfc（单文件组件）。这个目录下的逻辑就是把单文件的组件编译成JS对象。

### shared

VueJS的服务端和浏览器端公用的工具方法。


