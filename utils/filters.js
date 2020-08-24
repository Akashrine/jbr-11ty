const { DateTime } = require('luxon')

module.exports = {
    dateToFormat: function (date, format) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(
            String(format)
        )
    },

    iso: function (date) {
        return DateTime.fromJSDate(date).toISO({
            includeOffset: false,
            suppressMilliseconds: true
        })
    },

    readableDate: function (date, format) {
        // default to Europe/Vienna Timezone
        const dt = DateTime.fromJSDate(date, { zone: 'UTC+2' })
        if (!format) {
            format =
                dt.hour + dt.minute > 0 ? 'dd LLL yyyy - HH:mm' : 'dd LLL yyyy'
        }
        return dt.toFormat(format)
    },

    dateToISO: function (date) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
            includeOffset: false,
            suppressMilliseconds: true
        })
    },

    obfuscate: function (str) {
        const chars = []
        for (var i = str.length - 1; i >= 0; i--) {
            chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
        }
        return chars.join('')
    },

    fromIso: function (timestamp) {
        return DateTime.fromISO(timestamp, { zone: 'utc' }).toJSDate()
    },

    obfuscate: function (str) {
        const chars = []
        for (var i = str.length - 1; i >= 0; i--) {
            chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
        }
        return chars.join('')
    },

    slice: function (array, limit) {
        return limit > 0 ? array.slice(0, limit) : array.slice(limit)
    },

    stringify: function (json) {
        return JSON.stringify(json)
    },

    excludePost: function (allPosts, currentPost) {
        return allPosts.filter(
            (post) => post.inputPath !== currentPost.inputPath
        )
    },

    currentPage: function (allPages, currentPage) {
        const matches = allPages.filter(
            (page) => page.inputPath === currentPage.inputPath
        )
        if (matches && matches.length) {
            return matches[0]
        }
        return null
    },
    
    media: function (filename, page) {
        const path = page.inputPath.split('/')
        if (path.length && path.includes('posts')) {
            const subdir = path[path.length - 2]
            return `https://julien-brionne.fr/posts/${subdir}/${filename}`
        }
        return filename
    },

    getWebmentionsForUrl: (webmentions, url) => {
        return webmentions.children.filter(entry => entry['wm-target'] === url)
    },

    size: (mentions) => {
        return !mentions ? 0 : mentions.length
    },

    webmentionsByType: (mentions, mentionType) => {
        return mentions.filter(entry => !!entry[mentionType])
    },

    readableDateFromISO: (dateStr, formatStr = "dd LLL yyyy 'at' hh:mma") => {
        return DateTime.fromISO(dateStr).toFormat(formatStr);
    },

    excerpt: function (content) {
        const excerptMinimumLength = 80
        const excerptSeparator = '<!--more-->'
        const findExcerptEnd = (content) => {
            if (content === '') {
                return 0
            }

            const paragraphEnd = content.indexOf('</p>', 0) + 4
            if (paragraphEnd < excerptMinimumLength) {
                return (
                    paragraphEnd +
                    findExcerptEnd(
                        content.substring(paragraphEnd),
                        paragraphEnd
                    )
                )
            }

            return paragraphEnd
        }

        if (!content) {
            return
        }

        if (content.includes(excerptSeparator)) {
            return content.substring(0, content.indexOf(excerptSeparator))
        } else if (content.length <= excerptMinimumLength) {
            return content
        }

        const excerptEnd = findExcerptEnd(content)
        return content.substring(0, excerptEnd)
    }
}
