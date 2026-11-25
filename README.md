# 一二与布布 · 四系三章 PC 横屏 WebGL 完整迁移版 (v2)

阶段二全量迁移已完成：全部 **5 个职业**、**水/地/火/风 36 张库洛牌**、**56 件六阶赃物（含 36 件专属大红）**、**职业专属营地房（方案 B）** 与 **6 首原声 BGM** 均已迁入干净的五层 WebGL 架构。

## 快速启动

1. 首次安装依赖（若国内源慢可加 `--registry=https://registry.npmmirror.com`）：
   ```bash
   npm install
   ```
2. 启动开发预览（自动打开浏览器）：
   ```bash
   npm run dev
   ```
   > 也可双击 `start-dev.bat`（Windows）或运行 `./start-dev.sh`（macOS/Linux）。
3. 运行全 36 怪 × 5 职业内核自动化测试：
   ```bash
   npm run test:core
   ```
4. 运行 5 职业三章平衡模拟器（250 局）：
   ```bash
   npm run sim
   ```
5. 打包发布版（输出 `dist/`）：
   ```bash
   npm run build
   ```
