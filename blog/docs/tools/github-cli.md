---
tags:
  - GitHub
---

# GitHub CLI

GitHub CLI 是 GitHub 官方提供的命令行工具，命令名为 `gh`。

## 登录 GitHub

首次使用时执行：

```sh
gh auth login
```

会启动交互式向导进行登录。

查看当前登录状态：

```sh
gh auth status
```

如果使用 HTTPS，并希望让 Git 复用 `gh` 的认证信息，可以配置 Git credential helper：

```sh
gh auth setup-git
```

多账号登录后，可以切换当前账号：

```sh
gh auth switch
```

退出登录：

```sh
gh auth logout
```

该命令只删除本地保存的认证配置，不会撤销 GitHub 已签发的令牌。若令牌可能泄露，还需要前往 GitHub 的应用设置撤销 GitHub CLI 的访问权限。

## 获取帮助

`gh` 的命令通常分为资源和操作两层：

```sh
gh <资源> <操作> [参数]
```

例如：

```sh
gh repo clone cli/cli
gh issue list
gh pr create
gh run view
```

查看所有顶层命令：

```sh
gh help
```

查看某个资源或具体操作的帮助：

```sh
gh help pr
gh pr create --help
```

大部分与仓库有关的命令会根据当前目录的 Git remote 自动判断目标仓库。若不在仓库目录中，或要操作另一个仓库，可以使用 `-R OWNER/REPO`：

```sh
gh issue list -R cli/cli
gh pr view 123 -R cli/cli
```

## 仓库操作

### 查看和克隆仓库

在终端中查看当前仓库的信息：

```sh
gh repo view
```

在浏览器中打开当前仓库：

```sh
gh repo view --web
```

克隆仓库时可以直接使用 `OWNER/REPO`，不必复制完整 URL：

```sh
gh repo clone cli/cli
```

指定本地目录：

```sh
gh repo clone cli/cli workspace/cli
```

### 创建仓库

不带参数时，`gh` 会通过交互式向导创建仓库：

```sh
gh repo create
```

创建一个新的公开仓库，并立即克隆到本地：

```sh
gh repo create my-project --public --clone
```

将已有的本地仓库发布到 GitHub：

```sh
gh repo create my-project --private --source=. --remote=origin --push
```

其中：

- `--source=.` 使用当前目录作为源仓库
- `--remote=origin` 把新仓库添加为 `origin`
- `--push` 推送本地提交
- `--public`、`--private` 和 `--internal` 分别设置仓库可见性

### Fork 仓库

Fork 并克隆一个仓库：

```sh
gh repo fork cli/cli --clone
```

在已有仓库目录中执行 `gh repo fork` 时，`gh` 可以创建个人 Fork、调整 remote，并把原仓库配置为 `upstream`。执行后可用 Git 检查 remote：

```sh
git remote -v
```

## 管理 Issue

列出当前仓库中开放的 Issue：

```sh
gh issue list
```

按条件筛选：

```sh
gh issue list --label bug --assignee @me
gh issue list --state closed --limit 20
```

查看指定 Issue：

```sh
gh issue view 42
```

在浏览器中打开：

```sh
gh issue view 42 --web
```

交互式创建 Issue：

```sh
gh issue create
```

添加评论和关闭 Issue：

```sh
gh issue comment 42 --body "该问题已在 #51 中修复。"
gh issue close 42 --reason completed
```

## Pull Request 工作流

假设已经从 `main` 创建功能分支、完成修改并提交：

```sh
git switch -c docs/gh-tutorial
git add .
git commit -m "docs: add GitHub CLI tutorial"
```

### 创建 Pull Request

交互式创建：

```sh
gh pr create
```

根据当前分支的提交自动填写标题和正文：

```sh
gh pr create --fill
```

指定目标分支、标题和正文：

```sh
gh pr create \
  --base main \
  --title "docs: add GitHub CLI tutorial" \
  --body "补充 GitHub CLI 的安装与常用工作流。"
```

如果分支尚未推送，交互模式会询问要推送到哪个 remote。创建成功后，命令会输出 Pull Request URL。

在 PR 正文中写入 `Fixes #42` 或 `Closes #42`，合并后可以自动关闭对应 Issue。

### 查看和检出 Pull Request

列出开放的 PR：

```sh
gh pr list
```

查看当前分支对应的 PR：

```sh
gh pr view
```

查看指定 PR 的状态、差异和检查结果：

```sh
gh pr view 51
gh pr diff 51
gh pr checks 51
```

把别人的 PR 检出到本地：

```sh
gh pr checkout 51
```

### 审查和合并

批准、评论或请求修改：

```sh
gh pr review 51 --approve
gh pr review 51 --comment --body "整体没有问题，建议补充一个测试。"
gh pr review 51 --request-changes --body "请先处理空输入。"
```

合并 PR，并删除远程和本地分支：

```sh
gh pr merge 51 --squash --delete-branch
```

也可以将 `--squash` 换成 `--merge` 或 `--rebase`。仓库的分支保护规则仍然有效，检查未通过或审查未完成时，GitHub 可能拒绝立即合并。

## 配置、别名与自动补全

查看所有配置：

```sh
gh config list
```

设置首选 Git 协议和编辑器：

```sh
gh config set git_protocol ssh
gh config set editor "code --wait"
```

`--wait` 参数的作用是让终端在 VS Code 中打开文件后暂停等待，直到保存并关闭该文件后，终端才会继续向下执行。

创建命令别名：

```sh
gh alias set pv 'pr view'
gh alias set mine 'pr list --author @me'
```

之后可以执行：

```sh
gh pv 51
gh mine
```

生成当前 shell 的自动补全脚本：

```sh
gh completion --shell bash
gh completion --shell zsh
gh completion --shell powershell
```

具体加载方式取决于 shell，可以通过 `gh completion --help` 查看对应示例。
