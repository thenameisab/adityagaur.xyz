# Product captures

Every product screenshot under `public/work/` was taken from the real
application, running locally, against synthetic data. Not a mockup, not a
recreation, and not a production instance. This directory is how.

The rule these scripts exist to enforce is short: **nothing real reaches an
image.** The products these pages describe are internal tools whose seed data is
a live org chart, a live customer list, and a live Jira board. Screenshotting
them as they stand would publish all of it. So each app gets an aliasing pass
before it is served, the pass fails loudly if a real name survives into a file
the browser loads, and only then does the capture run.

## What's here

| File | What it does |
| --- | --- |
| `capture.mjs` | The harness. Takes a job file, drives Playwright, writes JPEGs. |
| `jobs/*.json` | One job per product: routes, viewports, actions, output names. |
| `synthetic-names.mjs` | The shared fictional cast, so the same real person becomes the same invented one in every app. |
| `alias-policy-console.mjs` | Rewrites the policy prototype's directory, brands and ids. |
| `alias-eng-dash.mjs` | Rewrites the engineering dashboard's identity map, Jira host and product names. |
| `build-wiki-synthetic.mjs` | Runs the wiki's shipped renderer over a fabricated workspace. |
| `wiki-corpus.mjs` | That workspace: twenty-seven pages for a company that does not exist. |

## Running one

The apps themselves are not in this repository — they live in their own repos on
the author's machine. The shape of a run is always the same:

```bash
# 1. copy the app somewhere disposable, never work in the original
rsync -a --exclude node_modules ~/path/to/app/ /tmp/capture/app/

# 2. replace every real identity, brand and address
node scripts/screenshots/alias-policy-console.mjs /tmp/capture/app

# 3. serve it, however that app is served
cd /tmp/capture/app && python3 -m http.server 4802

# 4. capture
node scripts/screenshots/capture.mjs scripts/screenshots/jobs/policy.json
```

Each alias script exits non-zero if a forbidden string survives into a served
file, so a failed run is a run that produced no images rather than one that
produced leaky ones.

## Conventions the captures follow

- **Device scale 2, downscaled to 2560px.** A plate frame is at most 1344 CSS px
  wide, so anything past ~2700 device pixels is bytes the reader never sees.
- **Motion frozen.** Animations, transitions and carets are disabled before the
  frame is taken, so a rerun produces the same pixels.
- **Dev-server chrome hidden.** The Next.js and Vite overlays are not part of
  any product.
- **The viewport is the crop.** Heights are chosen per route so a shot ends at
  the end of its content rather than in a field of empty background.

## What is *not* aliased

Third-party products the tools connect to — Jira, Notion, Slack, and the HRMS
vendors — keep their real names. They are other people's public products, named
here the way the wiki page already names Notion, and several are rendered from
their own logo endpoints; a renamed label beside a real mark would be the one
dishonest thing on the screen.
