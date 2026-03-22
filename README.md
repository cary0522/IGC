# IG Cut 📸

適用於 Instagram 發文尺寸的圖片組合工具，提升發布貼文的效率。

![IG Cut](https://img.shields.io/badge/Vue.js-3.5.13-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6.2.4-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1.8-38B2AC?style=flat-square&logo=tailwind-css)
![Vuetify](https://img.shields.io/badge/Vuetify-3.8.7-1867C0?style=flat-square&logo=vuetify)

## 🛠️ 技術架構

### 前端技術棧
- **框架**：Vue 3 (Composition API)
- **構建工具**：Vite 6.2.4
- **UI 框架**：Vuetify 3.8.7
- **CSS 框架**：Tailwind CSS 4.1.8
- **路由管理**：Vue Router 4.5.0
- **狀態管理**：Pinia 3.0.1

### 核心功能模組
- **圖片裁切**：vue-cropper 1.1.4
- **畫布渲染**：html2canvas 1.4.1
- **動畫效果**：Animate.css 4.1.1
- **提示框**：SweetAlert2 11.22.0

## 🚀 快速開始

### 1. 下載專案

```bash
git clone <repository-url>
cd IGC
```

### 2. 安裝

```bash
npm install
```

### 3. 開發環境運行

```bash
npm run dev
```

應用程式將在 `http://localhost:5173` 啟動

### 4. 打包

```bash
npm run build
```

### 5. 部署到 GitHub Pages

```bash
npm run demo
```

### 6. 代碼格式化

```bash
npm run format
```

## 📂 專案結構

```
IGC/
├── public/
│   ├── images/            # 靜態圖片
│   │   ├── IGC.png        # 網站 Logo
│   │   └── loading.gif    # 載入動畫
│   └── favicon.ico        # 網站圖標
├── src/
│   ├── views/             # 頁面視圖
│   │   └── MainView.vue   # 主要功能頁面（圖片編輯）
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── stores/            # Pinia 狀態管理
│   │   └── counter.js
│   ├── assets/            # 樣式和靜態資源
│   │   ├── base.css
│   │   ├── main.css
│   │   └── style.css
│   ├── App.vue            # 根組件
│   └── main.js            # 應用程式入口
├── index.html             # HTML 模板
├── package.json           # 專案配置
├── vite.config.js         # Vite 配置
└── tailwind.config.js     # Tailwind CSS 配置
```

## 🎯 使用指南

### 基本操作流程

1. **選擇拼接模式**
   - 點擊「兩張照片」或「四張照片」按鈕選擇拼接模式

2. **上傳圖片**
   - 點擊上傳按鈕選擇要拼接的圖片
   - 支援多張圖片同時上傳
   - 自動限制上傳數量（2張模式最多2張，4張模式最多4張）

3. **調整裁切區域**
   - 拖拽圖片進行位置調整
   - 縮放圖片以獲得最佳顯示效果
   - 每張圖片都可以獨立調整

4. **預覽效果**
   - 點擊「預覽」按鈕即時查看拼接效果
   - 預覽圖片會顯示在右側

5. **下載圖片**
   - 點擊「下載」按鈕保存最終圖片
   - 自動生成檔名格式：`final-image-{時間戳}.jpg`
   - 行動裝置上也可以長按「預覽圖片」保存圖片到相簿中

### 拼接模式說明

#### 兩張照片模式
- 圖片排列：左右並排
- 每張圖片佔用 50% 寬度，100% 高度
- 適合對比照片或雙人合照

#### 四張照片模式
- 圖片排列：2x2 網格
- 每張圖片佔用 50% 寬度，50% 高度
- 適合多角度展示或故事敘述

## ⚙️ 配置說明

### Vite 配置特點
- 設定 base 路徑為 `/IGC/` 適合 GitHub Pages 部署
- 整合 Tailwind CSS 插件
- 配置路徑別名 `@` 指向 `src` 目錄

### 圖片輸出設定
- **解析度**：3x 縮放，確保高品質輸出
- **格式**：JPEG 格式，品質設定為 100%
- **DPI**：300，適合印刷品質
- **背景色**：白色 (#ffffff)
- **尺寸比例**：4:5（Instagram 標準）
