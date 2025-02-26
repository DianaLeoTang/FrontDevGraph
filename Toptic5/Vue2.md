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


