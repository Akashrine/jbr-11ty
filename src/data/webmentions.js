/* Webmentions.io Connection and fetch */
// Dependencies 

const fs = require('fs')
const fetch = require('node-fetch')
const unionBy = require('lodash/unionBy')
const domain = require('./meta.json').domain

// Load environment variables
require('dotenv').config()

// Define cache, API url and Token 
const CACHE_FILE_PATH = '_cache/webmentions.json'
const API = 'https://webmention.io/api'
const TOKEN = process.env.WEBMENTION_IO_TOKEN

// Fetch webmentions 
async function fetchWebmentions(since, perPage = 10000) {
    // Check domain and token
    if (!domain || !TOKEN) {
      console.warn('>>> Fetch impossible, token or domain undefined')
      return false
    }
    
    let url = `${API}/mentions.jf2?domain=${domain}&token=${TOKEN}&per-page=${perPage}`
      if (since) url += `&since=${since}` // Fetch new webmentions
  
    const response = await fetch(url)
    if (response.ok) {
      const feed = await response.json()
      console.log(`>>> ${feed.children.length} new webmentions fetched through ${API}`)
      return feed
    }
  
    return null
}

// Merge webmentions through id
function mergeWebmentions(a, b) {
    return unionBy(a.children, b.children, 'wm-id')
}

// save merged webmention in the cache file
function writeToCache(data) {
    const dir = '_cache'
    const fileContent = JSON.stringify(data, null, 2)
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    // Write data in file
    fs.writeFile(CACHE_FILE_PATH, fileContent, err => {
      if (err) throw err
      console.log(`>>> webmentions mise en cache dans ${CACHE_FILE_PATH}`)
    })
  }

// Read from the cache file
function readFromCache() {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheFile = fs.readFileSync(CACHE_FILE_PATH)
      return JSON.parse(cacheFile)
    }
  
    // No cache found
    return {
      lastFetched: null,
      children: []
    }
  }
  
  module.exports = async function () {
    console.log('>>> Read webmentions through cache');
  
    const cache = readFromCache()
  
    if (cache.children.length) {
      console.log(`>>> ${cache.children.length} webmentions loaded from cache`)
    }
  
    // Ne télécharger les nouvelles webmentions qu'en production
    if (process.env.NODE_ENV === 'production') {
      console.log('>>> Check new webmentions...');
      const feed = await fetchWebmentions(cache.lastFetched)
      if (feed) {
        const webmentions = {
          lastFetched: new Date().toISOString(),
          children: mergeWebmentions(cache, feed)
        }
  
        writeToCache(webmentions)
        return webmentions
      }
    }
  
    return cache
  }