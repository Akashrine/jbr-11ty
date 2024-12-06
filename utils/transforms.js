import { minify } from 'html-minifier-terser';
import { generate } from 'critical';

const buildDir = 'dist';

// Helper function: Check if the output should be transformed
const shouldTransformHTML = (outputPath) =>
    outputPath &&
    outputPath.endsWith('.html') &&
    process.env.ELEVENTY_ENV === 'production';

// Helper function: Check if the output path is the homepage
const isHomePage = (outputPath) => outputPath === `${buildDir}/index.html`;

// HTML minification transform
export const htmlmin = (content, outputPath) => {
    if (shouldTransformHTML(outputPath)) {
        try {
            return minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
            });
        } catch (error) {
            console.error('HTML Minification Error:', error);
        }
    }
    return content;
};

// Critical CSS transform
export const critical = async (content, outputPath) => {
    if (shouldTransformHTML(outputPath) && isHomePage(outputPath)) {
        try {
            const config = {
                base: `${buildDir}/`,
                html: content,
                inline: true,
                width: 1280,
                height: 800,
                timeout: 30000,
            };
            const html = await generate(config);
            return html;
        } catch (error) {
            console.error('Critical CSS Generation Error:', error);
        }
    }
    return content;
};

// Export the transforms
export default {
    htmlmin,
    critical,
};
