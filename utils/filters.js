import { DateTime } from 'luxon';
import sanitizeHTML from 'sanitize-html';

const filters = {
    dateToFormat: (date, format) =>
        DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(String(format)),

    fromIso: (isoString, format = "dd LLL yyyy 'at' hh:mma") =>
        DateTime.fromISO(isoString, { zone: 'utc' }).toFormat(format),

    iso: (date) => DateTime.fromJSDate(new Date(date)).toISO(),
    
    readableDate: (date, format) => {
        const dt = DateTime.fromJSDate(date, { zone: 'UTC+2' });
        const defaultFormat =
            dt.hour + dt.minute > 0 ? 'dd LLL yyyy - HH:mm' : 'dd LLL yyyy';
        return dt.toFormat(format || defaultFormat);
    },

    obfuscate: (str) =>
        [...str].map((char) => `&#${char.charCodeAt()};`).join(''),

    slice: (array, limit) => (limit > 0 ? array.slice(0, limit) : array.slice(limit)),

    stringify: (json) => JSON.stringify(json),

    excludePost: (allPosts, currentPost) =>
        allPosts.filter((post) => post.inputPath !== currentPost.inputPath),

    currentPage: (allPages, currentPage) =>
        allPages.find((page) => page.inputPath === currentPage.inputPath) || null,

    media: (filename, page) => {
        const path = page.inputPath.split('/');
        if (path.includes('posts')) {
            const subdir = path.at(-2);
            return `https://julien-brionne.fr/posts/${subdir}/${filename}`;
        }
        return filename;
    },

    readableDateFromISO: (dateStr, formatStr = "dd LLL yyyy 'at' hh:mma") =>
        DateTime.fromISO(dateStr).toFormat(formatStr),

    isOwnWebmention: (webmention) => {
        const urls = ['https://julien-brionne.fr', 'https://twitter.com/akashrine'];
        const authorUrl = webmention.author?.url;
        return urls.includes(authorUrl);
    },

    webmentionCountByType: (webmentions, url, ...types) =>
        String(webmentions.filter((entry) => types.includes(entry['wm-property'])).length),

    webmentionsByUrl: (webmentions, url) => {
        const allowedTypes = ['mention-of', 'in-reply-to'];
        const allowedHTML = {
            allowedTags: ['b', 'i', 'em', 'strong', 'a'],
            allowedAttributes: { a: ['href'] },
        };

        const cleanEntry = (entry) => {
            const { html, text } = entry.content;
            entry.content.value = html
                ? sanitizeHTML(html, allowedHTML)
                : sanitizeHTML(text, allowedHTML);
            return entry;
        };

        return webmentions
            .filter((entry) => entry['wm-target'].includes(url))
            .filter((entry) => allowedTypes.includes(entry['wm-property']))
            .filter((entry) => entry.author && entry.published && entry.content)
            .sort((a, b) => new Date(a.published) - new Date(b.published))
            .map(cleanEntry);
    },

    excerpt: (content) => {
        if (!content) return '';
        const separator = '<!--more-->';
        if (content.includes(separator)) {
            return content.split(separator)[0];
        }
        return content.length > 80
            ? content.substring(0, content.indexOf('</p>', 80) + 4)
            : content;
    },
};

export default filters;
