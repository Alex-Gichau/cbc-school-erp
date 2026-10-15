# Resolving the MIME Type Error on Your Private Server

### The Error
> `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

---

## Why This Error Happens
Modern web applications built with Vite use **ES Modules** (`<script type="module" src="...">`).
The HTML specification strictly requires that browsers only execute module scripts if the server returns a valid JavaScript MIME type (`Content-Type: application/javascript` or `text/javascript`).

If your private web server does not recognize `.js` or `.mjs` extensions, it falls back to binary data: `application/octet-stream`. The browser rejects this for security reasons and stops loading the application.

---

## Solutions by Server Type

### 1. If using NGINX (Most Common)

In Nginx, if `include /etc/nginx/mime.types;` is omitted or if `.js`/`.mjs` is not defined in your `server` block, Nginx responds with `default_type application/octet-stream;`.

#### Fix:
Open your Nginx site configuration (e.g. `/etc/nginx/sites-available/default` or `/etc/nginx/conf.d/school.conf`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/school-system/dist;
    index index.html;

    # 1. Ensure system MIME types are included
    include /etc/nginx/mime.types;

    # 2. Add explicit types block
    types {
        application/javascript js mjs;
        application/wasm wasm;
        text/css css;
        text/html html htm;
        image/svg+xml svg;
        application/json json;
    }

    # 3. Static assets cache & correct MIME types
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        types {
            application/javascript js mjs;
            text/css css;
        }
    }

    # 4. Fallback for Single Page Application (SPA) routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 5. Reverse proxy API endpoints to Node (if using backend)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Then test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 2. If using Apache / cPanel / LiteSpeed

Place a `.htaccess` file inside your web root (or inside the `dist/` directory):

```apache
<IfModule mod_mime.c>
    AddType application/javascript .js .mjs
    AddType application/wasm .wasm
    AddType text/css .css
    AddType image/svg+xml .svg
    AddType application/json .json
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```
*(This has already been added to `/public/.htaccess` and will automatically be included in your `dist/` build).*

---

### 3. If running Node.js / Express (`dist/server.js` or `server.ts`)

If you are running the backend Express server directly on your private server, ensure:

1. **Build first**:
   ```bash
   npm run build
   ```
2. **Start with production mode**:
   ```bash
   NODE_ENV=production npm start
   # or with PM2:
   NODE_ENV=production pm2 start dist/server.js --name "school-system"
   ```

`server.ts` has been configured with explicit `Content-Type: application/javascript; charset=utf-8` header enforcement in both middleware and `express.static` file serving options.

---

### 4. If using Caddy Server

Add to your `Caddyfile`:

```caddy
yourdomain.com {
    root * /var/www/school-system/dist
    file_server {
        # Caddy automatically infers MIME types correctly
    }
    try_files {path} /index.html
}
```

---

### 5. If using Docker / Alpine Linux

Minimal Alpine Linux containers sometimes lack standard MIME tables. If running Nginx or Node in a minimal container, ensure `mailcap` or `mime-types` is installed:

```dockerfile
# For Alpine-based images:
RUN apk add --no-cache mailcap
```

---

## Quick Verification
To verify the fix from your terminal or server:
```bash
curl -I https://yourdomain.com/assets/index-xxxxxx.js
```
The response header should show:
```http
Content-Type: application/javascript; charset=utf-8
```
(not `application/octet-stream`).
