# 云服务器 nginx 部署配置（备用）

> 当前线上预览由 GitHub Pages 自动部署：<https://ingkele.github.io/apex-admin/>
> 本文档供迁移到自有云服务器时参考。构建产物是纯静态文件，任何静态服务器均可托管。

## 构建

```bash
pnpm install --frozen-lockfile
pnpm build          # 部署到域名根路径
# 或部署到子路径：
VITE_BASE=/apex-admin/ pnpm build
```

构建产物在 `dist/`，含 `index.html` + `404.html`（SPA fallback）+ `assets/` + 静态资源。

## nginx 站点配置（根路径部署）

```nginx
server {
    listen 80;
    server_name admin.example.com;   # 换成你的域名

    root /var/www/apex-admin/dist;
    index index.html;

    # SPA fallback：未知路径回退 index.html（前端路由接管）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 带 hash 的构建产物可长缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # gzip
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
```

## nginx 子路径部署（/apex-admin/）

构建时 `VITE_BASE=/apex-admin/`，nginx 配置改：

```nginx
location /apex-admin/ {
    alias /var/www/apex-admin/dist/;
    try_files $uri $uri/ /apex-admin/index.html;
}
```

## 部署步骤

```bash
# 本地构建后上传
pnpm build
scp -r dist/* root@your-server:/var/www/apex-admin/dist/

# 服务器上重载 nginx
nginx -t && systemctl reload nginx
```

## 注意事项

- 本项目是 SPA：任何未命中静态文件的路径都要回退 `index.html`，否则刷新深层路由（如 `/login`）会 404
- `404.html` 是给 GitHub Pages 用的 fallback 机制，nginx 用 `try_files` 即可，不需要它
- 若接后端 API，再加 `location /api/ { proxy_pass ... }` 反代即可
