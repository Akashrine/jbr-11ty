import { DateTime } from 'luxon';
import pluginRss from '@11ty/eleventy-plugin-rss';
import pluginNavigation from '@11ty/eleventy-navigation';
import pluginEmbedTweet from 'eleventy-plugin-embed-tweet';
import markdownIt from 'markdown-it';

import filters from './utils/filters.js';
import transforms from './utils/transforms.js';
import shortcodes from './utils/shortcodes.js';
import iconsprite from './utils/iconsprite.js';
import svgContents from 'eleventy-plugin-svg-contents';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItAnchor from 'markdown-it-anchor';

const anchorSlugify = (s) =>
    encodeURIComponent(
        String(s)
            .trim()
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, '')
            .replace(/\s+/g, '-')
    );

export default function (config) {
    // Plugins
    config.addPlugin(pluginRss);
    config.addPlugin(pluginNavigation);

    config.addPlugin(pluginEmbedTweet, {
        cacheDirectory: '',
        useInlineStyles: false,
    });
    config.addPlugin(svgContents);

    // Filters
    Object.entries(filters).forEach(([name, fn]) => config.addFilter(name, fn));

    // Transforms
    Object.entries(transforms).forEach(([name, fn]) =>
        config.addTransform(name, fn)
    );

    // Shortcodes
    Object.entries(shortcodes).forEach(([name, fn]) =>
        config.addShortcode(name, fn)
    );

    // Icon Sprite
    config.addNunjucksAsyncShortcode('iconsprite', iconsprite);

    // Asset Watch Targets
    config.addWatchTarget('./src/assets');

    // Markdown
    const markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
    })
        .use(markdownItAnchor, {
            permalink: markdownItAnchor.permalink.linkInsideHeader({
                symbol: '#',
                placement: 'before',
                class: 'heading-anchor',
            }),
            level: 2,
            slugify: anchorSlugify,
        })
        .use(markdownItFootnote);

    markdownLibrary.renderer.rules.footnote_block_open = () =>
        '<footer class="post__footnotes">\n' +
        '<h2 class="sr-only" id="footnote-label">Footnotes</h2>\n' +
        '<ol class="post__footnotes-list">\n';

    config.setLibrary('md', markdownLibrary);

    // Layouts
    config.addLayoutAlias('base', 'base.njk');
    config.addLayoutAlias('page', 'page.njk');
    config.addLayoutAlias('post', 'post.njk');

    // Pass-through files
    [
        'src/robots.txt',
        'src/site.webmanifest',
        'src/keybase.txt',
        'src/assets/images',
        'src/assets/fonts',
        'src/posts/**/*.jpg',
        'src/posts/**/*.png',
        'src/admin',
    ].forEach((path) => config.addPassthroughCopy(path));

    // Collections: Posts
    config.addCollection('posts', (collection) =>
        collection.getAllSorted().filter((item) => {
            const isPost = item.inputPath.includes('/posts/');
            const notDraft = !item.data.draft || process.env.ELEVENTY_ENV !== 'production';
            return isPost && notDraft;
        })
    );

    // Get the first `n` elements of a collection.
    config.addFilter('head', (array, n) =>
        n < 0 ? array.slice(n) : array.slice(0, n)
    );

    // Deep-Merge
    config.setDataDeepMerge(true);

    // Base Config
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data',
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
        passthroughFileCopy: true,
    };
}
