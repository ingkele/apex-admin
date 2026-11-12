# 腾讯云服务器自动发布配置指引

推送 `main` 分支后，GitHub Actions 自动构建并通过 rsync 部署到你的腾讯云服务器
（workflow：`.github/workflows/deploy-server.yml`）。服务器上**不需要**装 Node 环境。

## 一、生成部署专用密钥对（本地执行）

```bash
ssh-keygen -t ed25519 -C "apex-admin-deploy" -f apex-deploy -N ""
```

生成 `apex-deploy`（私钥）和 `apex-deploy.pub`（公钥）两个文件。

## 二、把公钥装到服务器

```bash
# 用你的正常账号登录服务器
ssh root@你的服务器IP

# 把 apex-deploy.pub 的内容追加进授权列表（一行命令，替换成公钥内容）
echo 'ssh-ed25519 AAAA... apex-admin-deploy' >> ~/.ssh/authorized_keys
```

## 三、配置 GitHub Secrets

仓库 → Settings → Secrets and variables → Actions → New repository secret：

| Secret 名 | 内容 | 必填 |
|---|---|---|
| `DEPLOY_HOST` | 服务器 IP 或域名 | ✅ |
| `DEPLOY_USER` | SSH 登录用户（如 `root`） | ✅ |
| `DEPLOY_PATH` | 部署目录（如 `/var/www/apex-admin`，**目录须存在**；1Panel 形态填网站运行目录，见下节） | ✅ |
| `DEPLOY_KEY` | `apex-deploy` 私钥**全部内容**（含首尾 BEGIN/END 行） | ✅ |
| `DEPLOY_PORT` | SSH 端口（不填默认 22） | 可选 |
| `VITE_BASE` | 部署路径 base（不填默认 `/` 根路径） | 可选 |

> 若部署到子路径（如 `/apex-admin/`），把 `VITE_BASE` 设为 `/apex-admin/`，
> 且 `DEPLOY_PATH` 设为该子路径对应的目录——两者必须匹配。

## 四、1Panel（OpenResty 网站）适配

服务器用 1Panel 的「网站」功能（OpenResty）托管时，不手写 nginx 配置文件，
在面板里填两处即可：

### 1. 运行目录 = `DEPLOY_PATH`

1Panel → 网站 → 选中站点 → 设置 → 网站目录 → **运行目录**，典型值：

```
/opt/1panel/apps/openresty/openresty/www/sites/<站点名>/index
```

把这个值填进 GitHub Secret `DEPLOY_PATH`。rsync 推的是宿主机目录，OpenResty
容器挂载该目录，静态文件落盘即生效——**不需要重启容器、不需要重建镜像**。

### 2. 伪静态 = SPA 回退规则

站点设置 → **伪静态**，填入（替代 `docs/nginx-deploy.md` 的手写配置）：

```nginx
location / {
    try_files $uri $uri.html $uri/ /index.html;
}
```

保存即生效（1Panel 自动重载 OpenResty）。这一步配一次就不用再动。

## 五、首次部署

1Panel 形态下目录已随建站自动创建，**跳过**下面的 mkdir。裸 nginx 形态先建目录：

```bash
mkdir -p /var/www/apex-admin && chown -R $USER /var/www/apex-admin
```

然后任意提交推 `main`（或仓库 Actions 页手动跑 `Deploy to Tencent Cloud`）。
部署用 rsync `--delete` 同步（服务器上多余文件会被清掉）。回退规则：1Panel
形态按上节填伪静态即可；裸 nginx 形态按 `docs/nginx-deploy.md` 配置
（都是配一次就不用再动）。

## 六、验证

```bash
curl -I http://你的服务器地址/        # 200
curl -I http://你的服务器地址/tasks   # 200（深链直访）
```

浏览器控制台不应再有资源 404。

## 安全提示

- 这把密钥只用于部署，别复用你的个人密钥
- 私钥只进 GitHub Secrets，不进 git 仓库、不发聊天记录
- 想吊销就删服务器 `authorized_keys` 里那一行，再在 GitHub 删掉 Secret
