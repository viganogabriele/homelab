# homelab.vigab.cc

Public showcase of a self-hosted homelab. It is one static page whose main feature is an
interactive, animated map of the infrastructure, in a public and sanitized version: pick a
destination and the map highlights conceptual relationships and dependencies. Deployment routes
and access controls are deliberately omitted; this is not an operational network map.

> **WARNING: THIS REPOSITORY IS PUBLIC.**
> Never put private data in it: no IP addresses (private ones included), ports, internal host
> or container names, guest IDs, internal domain records, people's or user names, e-mail
> addresses, MAC addresses, keys, tokens or passwords. The map uses generic names on purpose
> ("Reverse proxy", "NAS", "VPN gateway"). Run `node check.mjs` before every publication.
> The private, detailed map and documentation live elsewhere and never get copied here.

## Layout

```
public/                  what gets deployed (the whole site)
  index.html             page shell, SEO, Open Graph and Twitter tags, icon sprite
  assets/app.js          const DATA (all copy and the map model) + rendering, vanilla JS
  assets/site.css        styles, light and dark themes, reduced motion
  assets/theme.js        applies the saved theme before first paint
  favicon.svg            abstract network mark shared with the navbar
  apple-touch-icon.png    network mark, rendered at 180x180
  og.png                 sharing image, rendered at 1200x630
  robots.txt, sitemap.xml
design/                  sources of the generated images (og.svg, apple-touch-icon.svg)
_review/                 local screenshots and browser verification (not deployed)
check.mjs                sanitization check, zero dependencies
vercel.json              static deploy: runs the check, serves public/, security headers
```

No build step, no npm dependencies, no external CDN, self-hosted Space Grotesk and Space Mono (SIL OFL; licenses in `public/assets/fonts/`), no cookies, no
analytics. A strict Content Security Policy allows only the site's own files.

## Updating the content

All text lives in **one place**: the `const DATA = { ... }` block at the top of
`public/assets/app.js`.

- `DATA.page` holds the hero, principles, stack and footer copy.
- `DATA.ui` holds the map interface labels.
- `DATA.map` holds the map: `zones`, `groups`, `router`, `bus`, `nodes`, `edges`, `services`
  and their texts in `DATA.map.text`. The comment above `DATA` explains the model
  (coordinates, states, routes, dependencies).

Two exceptions, because crawlers and link previews do not run JavaScript: the `<title>`,
description and social tags in the `<head>` of `public/index.html`, and the text baked into
`design/og.svg` for link previews. Keep them in line with `DATA` when the pitch changes.

Rules of thumb for the map:

- Generic names only. Open-source product names are fine when they reveal nothing about the
  configuration (Proxmox, TrueNAS, WireGuard, Tailscale, Traefik, Immich, Home Assistant...).
- Do not show what is exposed to the internet or on which port, and do not add retired or
  broken hardware.
- Do not claim anything that is not true yet: map states use `state: "planned"` where
  appropriate. Describe component roles without announcing absent or future controls.

Preview locally (any static server works; the CSP needs http, not `file://`):

```sh
npm run preview          # python3 -m http.server 4173 --directory public
# then open the local address it prints
```

### Browser review

Use Chromium DevTools to check dark and light themes at desktop and phone widths.
The header changes colour after a small scroll and resets at the top; reduced motion
makes this state change immediate. Check wheel and touch scrolling, horizontal overflow,
console errors, anchor and ARIA targets, and navbar text contrast. Save evidence in `_review/`.
Review the network favicon at 16, 32 and 64 pixels on light and dark backgrounds.

### Regenerating the images

`public/og.png` (1200x630) and `public/apple-touch-icon.png` (180x180) are rendered from
`design/` with headless Chromium (Brave works too):

```sh
chromium --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=public/og.png "file://$PWD/design/og.svg"
chromium --headless=new --hide-scrollbars --window-size=180,180 --screenshot=public/apple-touch-icon.png "file://$PWD/design/apple-touch-icon.svg"
```

## The sanitization check

```sh
node check.mjs              # or: npm run check  (exit code 1 on any finding)
node check.mjs --self-test  # or: npm run check:test
```

`check.mjs` scans every file in the project, including itself, this README, file names and the
metadata chunks of PNG images. It catches conventional and padded IPv4, compressed and
mapped IPv6, numeric URL/host address forms and common HTML, Unicode and URL encodings,
last-octet and CIDR hints, port numbers next to a protocol, a host or a colon, any related domain
name other than `homelab.vigab.cc`, internal-looking host names and explicit hostname/container-name assignments, e-mail and MAC addresses (including dotted form), known token and key formats, high-entropy strings, Proxmox
guest IDs, local user paths and chat handles.

For extra local protection, `CHECK_DENY_FILE` can point to a private JSON array **outside this
project**. Entries are strings or objects with `term` and `category`. Keep that list private;
do not publish hashes of private names or ports either, as predictable values can be recovered.
No private list or recoverable hashes are shipped here. Without a private list, unknown personal
names and arbitrary single-label host/container names require manual review.

`--self-test` copies the project to a temporary directory, checks that the clean copy passes,
then injects one leak per rule (in a text file, inside `DATA`, and in PNG metadata) and checks
that each one is caught in the exact contaminated file. The private-list matcher is tested
with synthetic terms, not real infrastructure names.

This is a heuristic guard, not a proof of privacy: unknown personal names, arbitrary obfuscation,
and text baked into pixels still need manual review. Never copy private source files into this
folder. A false positive is fixed by rewording the content, never by weakening a rule.

The labels “in use” and “planned” describe the diagram, not live availability.
The map deliberately omits app exposure, endpoint names and transport configuration.

Final review evidence belongs in `_review/`, outside `public/`. It is not deployed. Browser
profiles are temporary and must be deleted after review; do not publish raw browser profiles.
Only `public/` is the Vercel output directory.

## Deploying on Vercel

The project is static; `vercel.json` already sets everything:

- install command: none; build command: `node check.mjs` (so a leak blocks the deploy);
- output directory: `public`;
- security headers (CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS).

Steps:

1. Push this folder to a public Git repository (or run `vercel` from this folder).
2. In Vercel: **Add New... > Project**, import the repository. Framework preset: **Other**.
   Leave build and output settings empty: `vercel.json` provides them.
3. Deploy, then open the preview URL and check the map, both themes and a phone.
4. **Settings > Domains**: add `homelab.vigab.cc`. In the parent DNS zone create the record
   Vercel asks for (usually a `CNAME` for `homelab`; if the zone is on Cloudflare, set it to
   DNS only so Vercel can issue the certificate).
5. Optional: test the link preview with any Open Graph debugger.

Nothing else is needed: no environment variables, no serverless functions, no analytics.
