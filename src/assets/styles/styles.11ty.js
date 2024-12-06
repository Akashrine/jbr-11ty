import fs from 'fs';
import path from 'path';
import * as sass from 'sass';
import CleanCSS from 'clean-css';
import cssesc from 'cssesc';

const isProd = process.env.ELEVENTY_ENV === 'production';

// Main entry point name
const ENTRY_FILE_NAME = 'main.scss';

export default class {
    async data() {
        const entryPath = path.join(new URL('.', import.meta.url).pathname, `/${ENTRY_FILE_NAME}`);
        return {
            permalink: `/assets/styles/main.css`,
            eleventyExcludeFromCollections: true,
            entryPath,
        };
    }

    // Compile Sass to CSS
    async compile(filePath) {
        try {
            return sass.compile(filePath, {
                style: 'expanded',
                sourceMap: !isProd,
            }).css;
        } catch (err) {
            throw new Error(err);
        }
    }

    // Minify & Optimize with CleanCSS in Production
    async minify(css) {
        if (!isProd) {
            return css;
        }
        const minified = new CleanCSS().minify(css);
        if (!minified.styles) {
            throw new Error(minified.error || 'CleanCSS failed to minify.');
        }
        return minified.styles;
    }

    // Display an error overlay when CSS build fails
    renderError(error) {
        return `
        /* Error compiling stylesheet */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: monospace;
            font-size: 1.25rem;
            line-height: 1.5;
        } 
        body::before { 
            content: ''; 
            background: #000;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            opacity: 0.7;
            position: fixed;
        }
        body::after { 
            content: '${cssesc(error)}'; 
            white-space: pre;
            display: block;
            top: 0; 
            padding: 30px;
            margin: 50px;
            width: calc(100% - 100px);
            color: #721c24;
            background: #f8d7da;
            border: solid 2px red;
            position: fixed;
        }`;
    }

    // Render the CSS file
    async render({ entryPath }) {
        try {
            const css = await this.compile(entryPath);
            const result = await this.minify(css);
            return result;
        } catch (err) { 
            if (isProd) {
                throw new Error(err);
            } else {
                console.error(err);
                const msg = err.message || 'Unknown error';
                return this.renderError(msg);
            }
        }
    }
}
