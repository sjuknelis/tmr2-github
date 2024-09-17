export function getTabTitle() {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            resolve(tabs[0].title);
        });
    });
}

export function getQuery() {
    // eslint-disable-next-line
    return location.search.slice(1);
}

export function openPopout(query) {
    // eslint-disable-next-line
    chrome.tabs.create({url: `popup/index.html?${query}`}, () => {});
}

export function closeWindow() {
    window.close();
}

export async function getStorageKey(key) {
    // eslint-disable-next-line
    return (await chrome.storage.local.get([key]))[key];
}

export async function setStorageKey(key, value) {
    const obj = {}
    obj[key] = value;
    
    // eslint-disable-next-line
    await chrome.storage.local.set(obj);
}