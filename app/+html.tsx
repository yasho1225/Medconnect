import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * Web-only: typography / touch defaults. Wide viewports use a centered max-width
 * column (`WebPhonePreview`) — PWA-style, not a simulated device bezel.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: mobilePreviewGlobalCss }} />
      </head>
      <body>
        <div className="mobile-app-shell">{children}</div>
      </body>
    </html>
  );
}

const mobilePreviewGlobalCss = `
html {
  height: 100%;
}
body {
  margin: 0;
  height: 100%;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
input, textarea, [contenteditable="true"] {
  user-select: text;
  -webkit-user-select: text;
}
.mobile-app-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
  min-height: 100dvh;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
[role="button"], button {
  cursor: pointer;
}

/* Desktop: neutral canvas (matches WebPhonePreview — no “stage lighting”) */
@media (min-width: 480px) {
  body {
    background-color: #c8ced9;
  }
}

@media (max-width: 479px) {
  body {
    background-color: #eef3fb;
  }
}
@media (prefers-color-scheme: dark) and (max-width: 479px) {
  body {
    background-color: #0a121f;
  }
}

.mobile-app-shell #root,
.mobile-app-shell > * {
  flex: 1 !important;
  min-height: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}
`;
