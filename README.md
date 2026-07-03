# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Running locally (dev)

To run the app locally with Vite dev server and open the editor from another device on the same network:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

If port `5173` is in use, Vite will automatically pick the next available port (for example `5174`). Open the app at:

- http://127.0.0.1:5173/Cyber-Editor/ on this machine
- http://<your-computer-ip>:5173/Cyber-Editor/ from another device on the same network

> You may need to allow access through Windows Firewall if prompted.

Place any images you want available to the gallery in the `public/` folder (for example `Nkar1.jpg`, `Nkar2.jpg`, `Nkar3.jpg`).
