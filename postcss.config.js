// Explicit, minimal PostCSS config. Having this file present stops Next.js
// from auto-detecting a tailwind.config.js (yours or a leftover from an
// earlier scaffold) and trying to require the `tailwindcss` package, which
// this project doesn't use — all styling in this app is plain CSS in
// src/app/globals.css.
module.exports = {
  plugins: {},
};
