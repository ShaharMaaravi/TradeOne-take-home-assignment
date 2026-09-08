# Netlify deployment

**Live site:** [https://shahar-tradeone-watchlist.netlify.app](https://shahar-tradeone-watchlist.netlify.app)

Published through Netlify CLI on 2026-09-08 from reviewed commit `c4a7b90`.
Signed-out verification passed for asset loading, catalogue membership, error
recovery, the mobile drawer and reload, with no browser errors or failed HTTP
responses. This project is linked locally but is not connected to Git deployment;
pushing to GitHub alone does not update the live site. Use the CLI instructions
below for subsequent releases, or connect the repository to enable automatic builds.

The app is a static Vite build. `netlify.toml` defines `npm run build`, the `dist`
publish directory, and Node 24 (also pinned by `.nvmrc`). There are no required
secrets, functions, databases, redirects or server-side routes. Review modes use
query strings on `/`, so a catch-all SPA rewrite is unnecessary.

## Connect the repository

After reviewing and pushing the final changes:

1. Sign in to Netlify and add a project by importing an existing Git repository.
2. Authorize access to `ShaharMaaravi/TradeOne-take-home-assignment` and select `main`.
3. Confirm the build command is `npm run build`, publish directory is `dist`, and
   the base directory is the repository root. Netlify reads these from the config.
4. Deploy, open the resulting `https://<site-name>.netlify.app` URL, and run the
   walkthrough in [SUBMISSION.md](SUBMISSION.md).
5. Replace the README's pending Live demo line with the verified public URL.

A Git-connected Netlify project normally deploys subsequent pushes automatically.
Our review-before-push workflow therefore remains the release boundary.

## Manual CLI alternative

Use this if you prefer uploading the reviewed build without connecting Git:

```sh
npm run check
npm run test:production
npx netlify-cli login
npx netlify-cli link
npx netlify-cli deploy --dir=dist --no-build
```

`link` selects an existing project; create the project in Netlify first if needed.
The deploy command above produces a draft URL. Verify that URL before publishing:

```sh
npx netlify-cli deploy --dir=dist --no-build --prod
```

Do not paste authentication tokens into the repository. Local `.netlify/` metadata
is ignored. Keep the same linked project for future releases so the submission
URL remains stable.

## Verification after publishing

- Open the public URL in a signed-out browser; verify the app is accessible.
- Check charts, local fonts and Apple/Meta/Shopify logos load without 404s.
- Add a security, switch lists and use the editor; verify the console is clean.
- Open `?live=0&scenario=load-error` and select Retry.
- Check the 390px layout and refresh the main URL.
- Include the final public URL and an accessible source-repository link in the
  submission. A public Netlify demo does not grant access to a private GitHub repo.

References: [Netlify's Vite setup](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
and [CLI deployment](https://cli.netlify.com/commands/deploy/).
