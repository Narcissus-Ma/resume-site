export const resumeData = {
  basicInfo: {
    title: "前端开发工程师",
    skills: [
      {
        category: "前端开发",
        items: [
          "HTML5/CSS3",
          "JS/TS",
          "React/Next.js",
          "Vue/Nuxt.js",
          "Webpack/Vite",
          "Sass/less/css-in-js",
        ],
      },
      {
        category: "多端开发",
        items: ["ReactNative", "uni-app", "taro", "mini-program", "electron"],
      },
      {
        category: "后端开发",
        items: [
          "Node.js",
          "Express",
          "Koa",
          "nest.js",
          "MySQL",
          "Java",
          "RESTful API",
        ],
      },
      { category: "开发工具", items: ["Git", "VS Code", "Docker", "Postman"] },
      {
        category: "AI辅助开发",
        items: ["Cursor", "cline", "Ollama", "copilot"],
      },
    ],
    skillDescriptions: [
      "熟练掌握HTML、CSS、JavaScript、Typescript等技术。",
      "熟练使用 react 技术，了解react相关生态及一些框架实现原理。",
      "熟悉vue2.0技术的基本使用，了解vue3.0技术及vue相关的一些生态。",
      "熟悉多端开发技术，了解小程序、uni-app、taro、react-native，electron等技术。",
      "熟悉nodejs技术，了解express、koa、nestjs，mysql,java 等后端框架和生态。",
      "熟练掌握AI辅助开发技巧，了解Cursor、cline、Ollama、copilot等AI工具的使用。",
      "熟悉webpack 及编译工具Babel，了解其原理以及其它一些构建工具比如vite,esbuild等。",
      "熟悉前端常用算法、浏览器网络安全知识、常用设计模式，追求开发高质量、可维护性代码。",
      "熟悉敏捷开发流程、把控前端代码提交质量、提高团队合作效率。",
      "熟悉低代码平台业务开发、平台搭建、对低代码无代码技术有足够的了解。",
    ],
  },
  experience: [
    {
      company: "郑州菏怀软件科技有限公司",
      position: "高级前端工程师",
      period: "2022.09 - 2024-12",
      achievements: [],
    },
    {
      company: "深圳市法本信息网络科技有限公司",
      position: "中级前端工程师",
      period: "2021.09 - 2022.08",
      achievements: [],
    },
    {
      company: "成都风灵网络科技有限公司",
      position: "前端开发工程师",
      period: "2020.10 - 2021.09",
      achievements: [],
    },
    {
      company: "深圳市易佰网络科技有限公司",
      position: "网站运营",
      period: "2017.09 - 2019.08",
      achievements: [],
    },
  ],
  projects: [
    {
      name: "物联应用开发平台",
      period: "2022.03 - 2024.12",
      description:
        "物联应用开发平台是一个以低代码为主、结合物联应用零代码的可视化前端应用开发平台，通过简单的拖拉拽可完成应用页面开发，并提供了数据源接口或数据库的绑定配置，项目基于开源项目appsmith搭建。",
      responsibilities: [
        "参与物料组件的开发规范及模版制定，代码编辑器语法推荐，复杂物料组件的集成开发，包括树形物料组件、富文本物料组件、图表物料组件、表格物料组件、翻页物料组件等。",
        "参与属性面板设置器开发规范制定，完善属性面板相关配置，包括日期选择设置器、文件选择设置器、动作选择设置器等。",
        "项目代码提交规范设置，包括eslint、prettier、commitlint、husky、cspell等。",
        "主导零代码物联应用业务组件的方案制定以及开发，包括物料业务组件的开发、数据源选择设置器的开发、封装物联应用数据源组件。",
        "增强布局引擎的相关功能，包括增加物料组件的键盘移动功能、画布标尺辅助线工能。通过制定分页的方案解决了表单组件无法自适应高度的问题。",
        "参与大文件上传功能方案的制定，通过设置大文件上传设置器直连第三方服务器，绕开平台开发协议，完成大文件上传的功能。",
        "主导应用发布鉴权方案的制定，完善应用数据导出导入功能的开发。",
        "参与后续项目的持续维护与迭代，解决用户反馈的问题，持续优化平台性能，提高用户体验。",
      ],
    },
    {
      name: "Booklide低代码平台",
      period: "2021.06 - 2021.12",
      description:
        "低代码+可视化搭建平台，涵盖数据源管理与加工、页面组装、流程引擎、低代码编辑器",
      responsibilities: [
        "参与页面组装模块设计，选用通用blocksuite (block) 方案，使页面元素及物料丰富高度可定制",
        "动态表单开发，借助 Vee- validate，基于hook实现可维护性更高的动态表单及表单设计工具",
        "低代码物料出码功能，基于vue-json-pretty封装物料协议数据预览与编辑",
        "主导封装webpack plugin 及 loader 支持静态资源自动上传、源码脱敏防备、构建优化等",
        "流程引擎及服务编排等内容实现、基于鼠标move事件封装vue draggable组件实现组件拖拽与页面内容编排",
        "数据源支持1000万行表格数据渲染与编辑，通过canvas技术实现",
      ],
    },
    {
      name: "前端业务组件hooks库",
      period: "2021.06 - 2021.12",
      description:
        "参与团队内前端自定义Hooks的封装与静态站点的构建，通过测试用例，保证交付Hooks的稳定性及健壮性，减少重复开发工作量，提供最佳实践。",
      responsibilities: [
        "使用pnpm作为包管理工具，提供基础能力封装；",
        "使用gulp和webpack实现UMD构建，将发包流程植入CI实现自动化发布，同时支持CHANGELOG的自动化更新部署；",
        "针对封装后的产物能力，使用dumi搭建静态站点，提供完整的出入参类型声明；",
        "使用jest对hooks进行测试用例的编码。",
      ],
    },
    {
      name: "餐饮SaaS管理平台",
      period: "2021.06 - 2021.12",
      description:
        "餐饮SaaS是一个为商家提供店铺管理、人员管理、销售业务统计、广告投放、活动设置的管理平台。",
      responsibilities: [
        "参与保时洁违规信息审核方案的制定，封装表单提交审核信息的react组件与vue组件，解决富文本图片无法轮询送审的问题。",
        "参与礼品卡对接抖店需求功能的开发，包括创建编辑页详情展示，处理页面埋点，权限控制，接入保时洁审核机制等。",
        "会员充值功能优化，包括管理页面的门店、员工二维码展示、添加新的模块小程序二维码，将原来的同步下载改为异步下载等。",
      ],
    },
  ],
  education: [
    {
      school: "湖北第二师范学院",
      degree: "国际贸易/本科 学士",
      period: "2013.09 - 2017.06",
      achievements: [],
    },
  ],
  website: [
    {
      name: "博客",
      url: "https://blog.384385.xyz/",
    },
    {
      name: "导航网站",
      url: "https://navigation.384385.xyz/",
    },
    {
      name: "低代码平台",
      url: "https://narcissus-ma.github.io/low-code-platform/#/",
    },
    {
      name: "自定义hooks",
      url: "https://narcissus-ma.github.io/narcissus-hooks/",
    },
    {
      name: "前端编码规范工程化",
      url: "https://narcissus-ma.github.io/nm-spec/",
    },
    {
      name: "GitHub",
      url: "https://github.com/Narcissus-Ma",
    },
    {
      name: "Gitee",
      url: "https://gitee.com/Narcissus-ma",
    },
  ],
  correctToken:
    "WyLpqazpuY/po54iLCIxNzY3MTYzNDE2NyIsIjU3NzAwODYzN0BxcS5jb20iXQ==",
};
