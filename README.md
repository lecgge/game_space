# Game Space

本地 PC 游戏库管理器 —— 一款基于 Electron + React 的桌面应用，帮助用户自动扫描、整理和启动本地游戏。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 桌面框架 | Electron | 42.x |
| 前端框架 | React | 18.x |
| 构建工具 | Vite | 6.x |
| 样式方案 | Tailwind CSS v4 | 4.x |
| 状态管理 | Zustand | 5.x |
| 路由 | React Router | 6.x |
| 动画 | Framer Motion | 11.x |
| 图标 | @phosphor-icons/react | 2.x |

## 核心功能

**游戏库管理**
- 自动扫描 Steam、Epic Games、Xbox 平台已安装游戏
- 手动添加自定义游戏目录并扫描可执行文件
- 游戏信息持久化存储（JSON 本地数据库）
- 支持搜索、筛选、排序浏览游戏列表

**界面与交互**
- PS5 风格深色沉浸式主题
- 浅色 / 深色双主题切换
- 侧边栏导航（首页、游戏库、导入、设置）
- 自定义无边框标题栏（最小化、最大化、关闭）
- Framer Motion 驱动的页面过渡动画

**平台适配**
- 无边框窗口设计，原生系统托盘体验
- 单实例锁，防止重复启动
- 安全 IPC 通信（contextIsolation: true）
- 支持 Windows / macOS 平台

## 项目结构

```
game_space/
├── electron/                # Electron 主进程
│   ├── main.js             # 主进程入口、IPC 处理、平台扫描
│   ├── preload.js          # 预加载脚本，暴露安全 API
│   └── database.js         # JSON 文件数据库
├── src/                     # 前端源码
│   ├── components/
│   │   ├── Layout.jsx      # 全局布局（标题栏 + 侧边栏 + 内容区）
│   │   ├── Sidebar.jsx     # 侧边栏导航
│   │   └── TitleBar.jsx    # 自定义标题栏
│   ├── pages/
│   │   ├── HomePage.jsx    # 首页仪表盘
│   │   ├── GameLibrary.jsx # 游戏库浏览
│   │   ├── ImportPage.jsx  # 导入 / 扫描游戏
│   │   └── SettingsPage.jsx # 设置（主题、扫描目录）
│   ├── store/index.js      # Zustand 全局状态
│   ├── App.jsx             # 应用入口与路由
│   ├── main.jsx            # 渲染入口
│   └── index.css           # Tailwind 主题与自定义样式
├── public/                  # 静态资源
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置
└── package.json
```

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发模式（Vite + Electron 同时启动）
npm run electron
```

开发模式会自动启动 Vite 开发服务器（http://localhost:5173）并等待其就绪后启动 Electron 窗口。

## 构建发布

```bash
# 仅构建前端
npm run build

# 构建并打包为安装程序
npm run electron:build
```

构建产物输出到 `release/` 目录，默认使用 electron-builder 生成 Windows NSIS 安装程序。

## 数据存储

游戏数据和用户设置保存在 Electron 的 `userData` 目录下，采用 JSON 文件形式存储，无需外部数据库依赖。

## 主题系统

应用通过 CSS 自定义属性（CSS Variables）和 `data-theme` 属性实现主题切换：
- 深色模式：默认主题，紫色主色调 + 深色背景
- 浅色模式：白色背景 + 柔和边框

主题选择会自动持久化到用户设置中。

## 许可证

本项目仅供学习和演示用途。
