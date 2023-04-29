# Environment for Front-end Development

Tool for developing Front-end applications written in HTML/EJS, CSS/SASS/SCSS and JavaScript.

## Features

1. Working with multiple projects.
2. Pre-defined codes makes it easy to get started with the project.
3. Live SASS compilation. CSS compression and vendor prefixing on production build.
4. JavaScript compression, babel processed JavaScript.
5. 7-1 folder architecture is used for SCSS development for maintainable and scalable code.
6. EJS/Pug template compilation support.
7. Axios, Bootstrap, Bulma, d3.JS, Font-awesome and TailwindCSS is installed as optional packages and ready to use only when needed. Other packages can also be used without any issues.

## Installation

**Node.JS** is required. Install it then run following code one by one in terminal from project directory,

```bash
npm i -D parcel parcel-namer-struct parcel-reporter-clean-dist parcel-transformer-ejs @parcel/packager-raw-url @parcel/transformer-sass @parcel/transformer-webmanifest pug prettier sass typescript @fortawesome/fontawesome-free
npm i -S axios bootstrap bulma d3 jquery tailwindcss @popperjs/core
npm run reset
```

Or, In any bash terminal (Git bash works too), run following to install all packages in one go,

```bash
npm i -D parcel parcel-namer-struct parcel-reporter-clean-dist parcel-transformer-ejs @parcel/packager-raw-url @parcel/transformer-sass @parcel/transformer-webmanifest sass pug prettier typescript @fortawesome/fontawesome-free && npm i -S axios bootstrap bulma d3 jquery tailwindcss @popperjs/core && npm run reset
```

Optionally, images can be optimized on production using below package. However, some additional configuration might be required.

```bash
npm i -D parcel-optimizer-imagemin
```

## Launch

Run development mode,

```bash
npm start
```

Build for production,

```bash
npm run build
```

## Usage

### Basic

**Stylesheets:** CSS/SASS/SCSS can be linked in HTML/EJS pages as usual using the `<link/>` tag.

**JavaScript:** JavaScript files can be linked following way,

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="app.js"></script>
  </head>
</html>
```

JavaScript files can also be imported via ES6 or CommonJS method in a JavaScript file.

```JavaScript
// ES6 import method
import {multiply} from './math.js';
export function square(x) {
  return multiply(x, x);
}
export function multiply(a, b) { // math.js file
  return a * b;
}

// CommonJS method
let math = require('./math');
exports.square = function(x) {
  return math.multiply(x, x);
};
exports.multiply = function(a, b) { // math.js file
  return a * b;
};
```

**Classic scripts/libaries:** These are JavaScript files that is loaded via the traditional `<script>` tag in HTML (without `type="module"`) or other means such as Workers. Include them in following way,

```html
<script src="jquery.js"></script>
<script>
  $(".banner").show(); // The $ variable is now available globally.
</script>
```

Alternatively,

```javascript
import axios from "./lib/axios.min";

// If above doesn't work as intended
import * as d3 from "./lib/d3.min";
window.axios = axios; // Makes it available globally
window.d3 = d3; // Makes it available globally
```

For JavaScript files that do not export (or is not needed as a variable) such as bootstrap.min.js, can be imported following way,

```javascript
// Importing Classic script
import "./lib/bootstrap.min";
// Importing from node_modules (ES6 "import" method)
import "bootstrap";
```

**Importing non-code assets from JavaScript:** To import files that do not require compilation include them in following way,

```JavaScript
const downloadUrl = new URL('download.zip', import.meta.url);
document.body.innerHTML = `<a href="${downloadUrl}">Download</a>`;
```

### Multiple Projects Configuration

By default project directory is set to "./src". To change the project/working directory, modify "package.json" file. As an example, if "project-1" is the new project directory then modify "scripts" field in "package.json" following way,

```json
"scripts": {
    "start": "parcel ./project-1/index.html",
    "build": "parcel build ./project-1/index.html --dist-dir ./project-1/dist --public-url ./",
    "reset": "node reset.js"
  },
```

### Common Libraries Installation

**Installation:**

```bash
npm i bootstrap jquery @popperjs/core
npm i -D @fortawesome/fontawesome-free
```

**Usage:**

```javascript
// main.js
import "bootstrap"; // Import bootstrap.js
```

CSS and SCSS files should be imported in "\_vendor.scss" following way,

```scss
// _vendor.scss
$fa-font-path: "../../node_modules/@fortawesome/fontawesome-free/webfonts"; // set $fa-font-path value
@import "~@fortawesome/fontawesome-free/scss/fontawesome";
@import "~@fortawesome/fontawesome-free/scss/solid";
@import "~@fortawesome/fontawesome-free/scss/regular";
@import "~@fortawesome/fontawesome-free/scss/brands";
@import "~bootstrap/scss/bootstrap";
```

### SCSS 7-1 Folder Architecture

**abstracts** - Codes that does not output CSS (variables, mixins, functions).

**vendor** - Importing icons/fonts, CSS libraries and other predefined CSS.

**base** - Basic project definitions (base (CSS Reset), animation, typography, utilities).

**layout** - Elements that should work everywhere and on all pages (global grid, navigation, header, footer, sidebar).

**pages** - Very specific styles for a specific page like for example, a homepage. Basically, styles for the sections of a page is written here.

**components** - One file for each component. Components are reusable building blocks and independent of each other. Components are held together by the layout of the page. Example: buttons, card etc.

**themes** - Develop multiple themes/variations like light and dark mode for a website. After writing the mixins, include them here.

## FAQ

No Frequently asked questions.
