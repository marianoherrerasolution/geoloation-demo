## Usage

- Install dependencies.

  ```shell
  npm install
  ```

- Run dev server.

  ```shell
  npm run dev
  ```

- Finally, visit [`http://localhost:5173`](http://localhost:5173) from your browser. Credentials can be found above.

## Config

Settings including app name, theme color, meta tags, etc. can be controlled from one single file **`config.ts`** located at the project's root.

```ts
//config.ts
const CONFIG = {
  appName: 'geonius-frontend',
  helpLink: 'https://github.com/geniusdev021/geolocation',
  enablePWA: true,
  theme: {
    accentColor: '#818cf8',
    sidebarLayout: 'mix',
    showBreadcrumb: true,
  },
  metaTags: {
    title: 'Geonius',
    description:
      'An out-of-box UI solution for enterprise applications as a React boilerplate.',
    imageURL: 'logo.svg',
  },
};

export default CONFIG;
```
