const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const pluginEmbedTweet = require("eleventy-plugin-embed-tweet")
const markdownIt = require('markdown-it')

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')
const iconsprite = require('./utils/iconsprite.js')
const svgContents = require("eleventy-plugin-svg-contents");


module.exports = function (config) {
    // Plugins
    config.addPlugin(pluginRss)
    config.addPlugin(pluginNavigation)

    let tweetEmbedOptions = {
        cacheDirectory: '', // default: ''
        useInlineStyles: false // default: true
    }
    config.addPlugin(pluginEmbedTweet, tweetEmbedOptions)
    config.addPlugin(svgContents);  


    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName])
    })

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName])
    })

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })

    // Icon Sprite
    config.addNunjucksAsyncShortcode('iconsprite', iconsprite)

    // Asset Watch Targets
    config.addWatchTarget('./src/assets')

    // Markdown
    config.setLibrary(
        'md',
        markdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
    )

    // Layouts
    config.addLayoutAlias('base', 'base.njk')
    config.addLayoutAlias('page', 'page.njk')
    config.addLayoutAlias('post', 'post.njk')

    // Pass-through files
    config.addPassthroughCopy('src/robots.txt')
    config.addPassthroughCopy('src/site.webmanifest')
    config.addPassthroughCopy('src/keybase.txt')
    config.addPassthroughCopy('src/assets/images')
    config.addPassthroughCopy('src/assets/fonts')
    config.addPassthroughCopy("src/posts/**/*.jpg")
    config.addPassthroughCopy("src/posts/**/*.png")

    // Collections: Posts
    config.addCollection('posts', function (collection) {
        const pathsRegex = /\/posts\//
        const coll = collection.getAllSorted()

        return coll
            .filter((item) => item.inputPath.match(pathsRegex) !== null)
            .filter((item) => item.data.permalink !== false)
            .filter((item) => !(item.data.draft && isProduction))
    })


    // Get the first `n` elements of a collection.
    config.addFilter("head", (array, n) => {
        if( n < 0 ) {
        return array.slice(n);
        }

        return array.slice(0, n);
    })

    // WEBMENTIONS FILTER
    config.addFilter('webmentionsForUrl', (webmentions, url) => {
    // define which types of webmentions should be included per URL.
    // possible values listed here:
    // https://github.com/aaronpk/webmention.io#find-links-of-a-specific-type-to-a-specific-page
    const allowedTypes = ['mention-of', 'in-reply-to']

    // define which HTML tags you want to allow in the webmention body content
    // https://github.com/apostrophecms/sanitize-html#what-are-the-default-options
    const allowedHTML = {
      allowedTags: ['b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: {
        a: ['href']
      }
    }

    // clean webmention content for output
    const clean = (entry) => {
      const { html, text } = entry.content

      if (html) {
        // really long html mentions, usually newsletters or compilations
        entry.content.value =
          html.length > 2000
            ? `mentioned this in <a href="${entry['wm-source']}">${entry['wm-source']}</a>`
            : sanitizeHTML(html, allowedHTML)
      } else {
        entry.content.value = sanitizeHTML(text, allowedHTML)
      }

      return entry
    }

    // sort webmentions by published timestamp chronologically.
    // swap a.published and b.published to reverse order.
    const orderByDate = (a, b) => new Date(b.published) - new Date(a.published)

    // only allow webmentions that have an author name and a timestamp
    const checkRequiredFields = (entry) => {
      const { author, published } = entry
      return !!author && !!author.name && !!published
    }

    // run all of the above for each webmention that targets the current URL
    return webmentions
      .filter((entry) => entry['wm-target'] === url)
      .filter((entry) => allowedTypes.includes(entry['wm-property']))
      .filter(checkRequiredFields)
      .sort(orderByDate)
      .map(clean)
  })

    // Deep-Merge
    config.setDataDeepMerge(true)

    // Base Config
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data'
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
        passthroughFileCopy: true
    }
}
