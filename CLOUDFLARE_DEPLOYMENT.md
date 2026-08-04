# OWNEX Cloudflare deployment

This repository contains two Cloudflare Pages frontends on branch `ownex-redesign-preview`:

1. Public website
   - Project name: `ownex-redesign-preview`
   - Production branch: `ownex-redesign-preview`
   - Root directory: `/`
   - Build command: leave empty
   - Build output directory: `/`

2. Admin website
   - Recommended project name: `ownex-commerce-admin`
   - Production branch: `ownex-redesign-preview`
   - Root directory: `admin`
   - Build command: leave empty
   - Build output directory: `/`

The admin frontend currently calls the existing API at `https://ownex-commerce-admin.manhddmkt.chatgpt.site`. Do not remove that service until the Cloudflare CMS API migration is complete.

## Recommended CMS target architecture

- Public site: Cloudflare Pages
- Admin site: Cloudflare Pages protected by Cloudflare Access
- API: Cloudflare Workers
- Structured content and version metadata: Cloudflare D1
- Images and uploaded files: Cloudflare R2
- Secrets: Cloudflare Worker secrets
- Audit log: D1

## Domain migration

When domains are ready:

- Attach the public domain to the public Pages project.
- Attach an admin subdomain such as `admin.example.com` to the admin Pages project.
- Protect the admin hostname with Cloudflare Access before sharing it.
- Keep the old Pages domains active until DNS and SSL are verified.
- Update API CORS allowlists and Content Security Policy after the final hostnames are known.

## Safety

Never commit Cloudflare API tokens, GitHub tokens, API keys, passwords, or database credentials to this repository.
