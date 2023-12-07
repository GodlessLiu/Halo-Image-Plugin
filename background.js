import { uploadToHalo, fetchImage } from './utils/index.mjs';

let token;
let domain;
let slugify;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  generateConfig();
  // 如果需要回复，可以使用 sendResponse
  sendResponse({ message: 'Hello from background.js!' });
});

async function genericOnClick(info) {
  chrome.storage.sync.get(
    {
      haloToken: '',
      haloDomain: '',
      haloSlugify: '',
    },
    async function (items) {
      token = items.haloToken;
      domain = items.haloDomain;
      slugify = items.haloSlugify;
      if (!token || !domain) {
        chrome.notifications.create({
          type: 'basic',
          title: 'Halo',
          message: '请先填写Halo的Token和域名',
          iconUrl: 'icon.png',
        });
        return;
      }
      const formData = await fetchImage(info, slugify);
      await uploadToHalo(formData, domain, token);
    }
  );
}

chrome.contextMenus.onClicked.addListener(genericOnClick);

chrome.runtime.onInstalled.addListener(async function () {
  chrome.contextMenus.create({
    title: '上传到我的Halo附件',
    contexts: ['image'],
    id: '1',
  });
});
