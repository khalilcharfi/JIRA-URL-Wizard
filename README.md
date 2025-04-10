This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `index.tsx`. It should auto-update as you make changes. To add an options page, simply add a `index.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Optimization

The build process includes an optimization step that minimizes JavaScript, HTML, CSS, and image files. For better image optimization results, install the required tools:

```bash
# Install image optimization tools
npm run install-image-tools
# or
pnpm install-image-tools
```

This will install platform-specific tools:
- pngquant/optipng for PNG optimization
- jpegoptim for JPEG optimization
- svgo for SVG optimization
- gifsicle for GIF optimization
- webp tools for WebP optimization

### Image Optimization

Image optimization is automatically applied during the build process. If you want to run image optimization separately without rebuilding the entire extension, you can use:

```bash
# Run only image optimization on the build directory
npm run optimize-images
# or
pnpm optimize-images
```

This is useful when you've added new images to the build directory and want to optimize them without going through the entire build process again.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
