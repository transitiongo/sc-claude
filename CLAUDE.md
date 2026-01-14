# Project Rules

## 发布流程

1. **升级版本号**
   ```bash
   npm version patch --no-git-tag-version  # 小版本 0.0.x
   npm version minor --no-git-tag-version  # 次版本 0.x.0
   npm version major --no-git-tag-version  # 主版本 x.0.0
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "feat/fix: 描述"
   git push origin main
   ```

3. **发布到 npm**（由用户手动执行，需要 OTP 二次验证）
   ```bash
   npm publish --access public
   ```

## 注意事项

- npm publish 需要 OTP 验证，Claude 无法代替执行
- 包名: `sc-claude`
- 命令: `sc`
