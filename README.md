# AILida - 智能导航

一个简洁美观的个人导航网站，部署在GitHub Pages上。

## 功能特性

- ✨ 简洁现代的Apple风格设计
- ⏰ 实时时间、日期和问候语显示
- 🔍 多搜索引擎支持（Google、百度、必应）
- 📱 可自定义快捷导航网站
- 🔒 删除快捷方式需要密码验证（默认密码：741852）
- 🔄 支持拖拽排序快捷方式
- 🎨 自定义图标颜色
- 💾 本地存储保存配置
- 📱 响应式设计，支持移动端

## 使用方法

### 访问网站
直接访问: https://jyg008.github.io/ailida/

### 自定义快捷方式
1. 点击右下角的 "+" 按钮添加新快捷方式
2. 右键点击快捷方式可以编辑或删除
3. 删除快捷方式需要输入密码验证（默认密码：741852）
4. 拖拽快捷方式可以自由调整顺序
5. 所有配置会自动保存到浏览器本地存储

### 切换搜索引擎
点击搜索框右侧的搜索引擎按钮即可切换

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/jyg008/ailida.git

# 进入目录
cd ailida

# 使用任意HTTP服务器打开
# 例如使用Python:
python -m http.server 8000

# 或使用Node.js的http-server:
npx http-server
```

然后访问 http://localhost:8000

## 技术栈

- 纯HTML/CSS/JavaScript
- 无框架依赖，轻量快速
- LocalStorage API 本地存储
- CSS Grid 响应式布局
- 毛玻璃效果（Glassmorphism）

## 部署

本项目已配置为GitHub Pages自动部署：
1. 推送到main分支
2. GitHub会自动构建和部署
3. 访问 https://jyg008.github.io/ailida/

## 自定义背景

如需更换背景图片，修改 `style.css` 中的 `.background-overlay` 部分：

```css
.background-overlay {
    background-image: url('你的图片URL');
}
```

## License

MIT License

---

🤖 Generated with [CodeArts](https://www.huaweicloud.com/product/codearts.html)
