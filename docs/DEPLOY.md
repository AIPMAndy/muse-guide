# GitHub Pages 发布与 404 排错

1. 仓库是公开的 `AIPMAndy/muse-guide`，默认分支为 `main`。
2. 在 `Settings → Pages → Build and deployment → Source` 选择 **GitHub Actions**。
3. 推送 `main` 会自动执行 `.github/workflows/deploy-pages.yml`。
4. 在 Actions 检查 `test` 与 `deploy` 均为 success。
5. 网站地址： https://aipmandy.github.io/muse-guide/ ；若 404，先看 Pages 是否启用、Actions 是否失败、根目录是否有 `index.html`。
6. 变更后的检查：PC/手机、中文字体、目录链接、筛选与复制、脱敏提示、微信/官网入口。

本地：

```bash
python3 -m unittest discover -s tests -v
python3 -m http.server 8000
```

网站使用相对路径 `assets/`、`data/` 和 `guides/`，适用于项目路径的 GitHub Pages。不要将原始 `.md` 路径假定为 HTML 化的专属阅读页。
