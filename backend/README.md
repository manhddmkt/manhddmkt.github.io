# Ownex Legit API proxy

This service keeps the LegitFulfill bearer token off the public GitHub Pages website. The browser can read the product catalog through `GET /api/products`. All order routes require the private `X-Ownex-Admin-Key` header and are intended only for trusted server-to-server or admin use.

## Routes

- `GET /healthz`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/orders` (admin)
- `POST /api/orders` (admin, creates an order)
- `POST /api/orders/tracking` (admin)
- `GET /api/orders/:id` (admin)
- `DELETE /api/orders/:id` (admin)

## Oracle deployment

1. Install Docker Engine and the Docker Compose plugin on the Oracle VM.
2. Copy this `backend` directory to `/opt/ownex-api`.
3. Copy `.env.example` to `.env` and set a newly generated `LEGIT_ACCESS_TOKEN` and a long random `OWNEX_ADMIN_KEY`.
4. Add `API_DOMAIN` to `.env`. A custom domain is best. For an initial deployment, a hostname such as `api.203-0-113-10.sslip.io` can point to the VM public IP without separate DNS setup.
5. Allow inbound TCP ports 80 and 443 in both the Oracle network security list and the VM firewall.
6. Run `docker compose up -d --build`.
7. Verify `https://<API_DOMAIN>/healthz`, then set `apiBaseUrl` in the website's `public/runtime-config.js` to `https://<API_DOMAIN>` and rebuild the site.

Do not commit `.env`, tokens, passwords, or admin keys. The default documented Legit endpoints can be overridden with the `LEGIT_*_PATH` variables if LegitFulfill changes its routes.
