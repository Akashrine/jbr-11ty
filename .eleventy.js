const { DateTime } = require('luxon');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginNavigation = require('@11ty/eleventy-navigation');
const pluginEmbedTweet = require('eleventy-plugin-embed-tweet');
const markdownIt = require('markdown-it');
const UpgradeHelper = require("@11ty/eleventy-upgrade-help");

const filters = require('./utils/filters.js');
const transforms = require('./utils/transforms.js');
const shortcodes = require('./utils/shortcodes.js');
const iconsprite = require('./utils/iconsprite.js');
const svgContents = require('eleventy-plugin-svg-contents');
const markdownItFootnote = require('markdown-it-footnote');
const markdownItAnchor = require('markdown-it-anchor');

const anchorSlugify = (s) =>
    encodeURIComponent(
        String(s)
            .trim()
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, '')
            .replace(/\s+/g, '-')
    );

module.exports = function (config) {
    // Plugins
    config.addPlugin(pluginRss);
    config.addPlugin(pluginNavigation);

    let tweetEmbedOptions = {
        cacheDirectory: '', // default: ''
        useInlineStyles: false // default: true
    };
    config.addPlugin(pluginEmbedTweet, tweetEmbedOptions);
    config.addPlugin(svgContents);
    config.addPlugin(UpgradeHelper);

    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName]);
    });

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName]);
    });

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName]);
    });

    // Icon Sprite
    config.addNunjucksAsyncShortcode('iconsprite', iconsprite);

    // Asset Watch Targets
    config.addWatchTarget('./src/assets');

    // Markdown
    let markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
    })
        .use(markdownItAnchor, {
            permalink: markdownItAnchor.permalink.linkInsideHeader({
                symbol: '#',
                placement: 'before',
                class: 'heading-anchor'
            }),
            level: 2,
            slugify: anchorSlugify,
        })
        .use(markdownItFootnote);

    markdownLibrary.renderer.rules.footnote_block_open = () => (
        '<footer class="post__footnotes">\n' +
        '<h2 class="sr-only" id="footnote-label">Footnotes</h2>\n' +
        '<ol class="post__footnotes-list">\n'
    );

    config.setLibrary("md", markdownLibrary);

    // Layouts
    config.addLayoutAlias('base', 'base.njk');
    config.addLayoutAlias('page', 'page.njk');
    config.addLayoutAlias('post', 'post.njk');

    // Pass-through files
    config.addPassthroughCopy('src/robots.txt');
    config.addPassthroughCopy('src/site.webmanifest');
    config.addPassthroughCopy('src/keybase.txt');
    config.addPassthroughCopy('src/assets/images');
    config.addPassthroughCopy('src/assets/fonts');
    config.addPassthroughCopy('src/posts/**/*.jpg');
    config.addPassthroughCopy('src/posts/**/*.png');
    config.addPassthroughCopy('src/admin');

    // Collections: Posts
    config.addCollection('posts', function (collection) {
        const pathsRegex = /\/posts\//;
        const coll = collection.getAllSorted();

        return coll
            .filter((item) => item.inputPath.match(pathsRegex) !== null)
            .filter((item) => item.data.permalink !== false)
            .filter((item) => !(item.data.draft && isProduction));
    });

    // Get the first `n` elements of a collection.
    config.addFilter('head', (array, n) => {
        if (n < 0) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });

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
};