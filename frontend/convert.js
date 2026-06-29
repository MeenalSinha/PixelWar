const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('generated.html', 'utf8');

// 1. Extract Tailwind Config
const twConfigMatch = html.match(/tailwind\.config = (\{[\s\S]*?\})\s*<\/script>/);
let twConfigStr = twConfigMatch ? twConfigMatch[1] : '';
twConfigStr = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
` + twConfigStr.replace(/^\{/, '').replace(/\}$/, '') + '\n};';
fs.writeFileSync('tailwind.config.js', twConfigStr);

// 2. Extract Styles
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const styles = styleMatch ? styleMatch[1].trim() : '';
let globals = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  image-rendering: pixelated;
}

` + styles;
fs.writeFileSync('app/globals.css', globals);

// 3. Extract Body contents for page.tsx
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<script>/);
let bodyContent = bodyMatch ? bodyMatch[1].trim() : '';
// Replace class= with className=
bodyContent = bodyContent.replace(/class=/g, 'className=');
// Replace inline styles
bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styleStr) => {
    const styleObj = styleStr.split(';').filter(s => s.trim()).reduce((acc, s) => {
        let [key, ...valParts] = s.split(':');
        let val = valParts.join(':');
        if (!key || !val) return acc;
        key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        acc[key] = val.trim();
        return acc;
    }, {});
    return 'style={' + JSON.stringify(styleObj) + '}';
});

// Remove html comments which cause errors in JSX
bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');

const pageContent = `import React from 'react';

export default function Page() {
  return (
    <>
      ${bodyContent}
    </>
  );
}
`;
fs.writeFileSync('app/page.tsx', pageContent);

// 4. Update layout.tsx
let layout = fs.readFileSync('app/layout.tsx', 'utf8');
const bodyClassMatch = html.match(/<body class="([^"]*)"/);
const bodyClasses = bodyClassMatch ? bodyClassMatch[1] : 'bg-background text-on-background font-body-md overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed';
// Update body className in layout.tsx
layout = layout.replace(/<body className="[^"]*"/, '<body className="' + bodyClasses + '"');

// Extract links
const links = html.match(/<link[^>]*>/g) || [];
const headContent = links.join('\n        ');
layout = layout.replace(/<head>[\s\S]*?<\/head>/, '<head>\n        ' + headContent.replace(/&amp;/g, '&') + '\n      </head>');
fs.writeFileSync('app/layout.tsx', layout);

console.log('Conversion successful!');
