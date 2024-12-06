import fs from 'fs';
import { config as dotenvConfig } from 'dotenv';
import unionBy from 'lodash/unionBy.js';

// Lecture manuelle du fichier meta.json
const meta = JSON.parse(fs.readFileSync('./src/data/meta.json', 'utf-8'));

const domain = meta.domain;

// Charger les variables d'environnement
dotenvConfig();

const CACHE_DIR = '_cache';
const API_ORIGIN = 'https://webmention.io/api/mentions.jf2';
const TOKEN = process.env.WEBMENTION_IO_TOKEN;

async function fetchWebmentions(since) {
    if (!domain) {
        console.warn(
            '>>> unable to fetch webmentions: no domain name specified in meta.json'
        );
        return false;
    }

    if (!TOKEN) {
        console.warn(
            '>>> unable to fetch webmentions: no access token specified in environment.'
        );
        return false;
    }

    let url = `${API_ORIGIN}?token=${TOKEN}`;
    url += since ? `&per-page=100` : `&per-page=999`;

    // Importer node-fetch de manière dynamique
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;
    } catch (err) {
        console.error('Failed to load node-fetch:', err);
        return null;
    }

    const response = await fetch(url);

    if (response.ok) {
        const feed = await response.json();
        console.log(
            `${feed.children.length} webmentions fetched from ${API_ORIGIN}`
        );
        return feed;
    }

    return null;
}

function mergeWebmentions(a, b) {
    return unionBy(a.children, b.children, 'wm-id');
}

function writeToCache(data) {
    const filePath = `${CACHE_DIR}/webmentions.json`;
    const fileContent = JSON.stringify(data, null, 2);

    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR);
    }

    fs.writeFileSync(filePath, fileContent);
    console.log(`webmentions cached to ${filePath}`);
}

function readFromCache() {
    const filePath = `${CACHE_DIR}/webmentions.json`;

    if (fs.existsSync(filePath)) {
        const cacheFile = fs.readFileSync(filePath);
        return JSON.parse(cacheFile);
    }

    return {
        lastFetched: null,
        children: [],
    };
}

export default async function fetchAndCacheWebmentions() {
    const cache = readFromCache();
    const { lastFetched } = cache;

    if (process.env.ELEVENTY_ENV === 'production' || !lastFetched) {
        const feed = await fetchWebmentions(lastFetched);

        if (feed) {
            const webmentions = {
                lastFetched: new Date().toISOString(),
                children: mergeWebmentions(cache, feed),
            };

            writeToCache(webmentions);
            return webmentions;
        }
    }

    console.log(`${cache.children.length} webmentions loaded from cache`);
    return cache;
}
