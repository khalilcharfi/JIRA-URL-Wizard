// Loads image assets using chrome.runtime.getURL

const imageAssets = {
    app: chrome.runtime.getURL("assets/app.webp"),
    drupal7: chrome.runtime.getURL("assets/drupal7.webp"),
    drupal9: chrome.runtime.getURL("assets/drupal9.webp"),
};

export default imageAssets;
