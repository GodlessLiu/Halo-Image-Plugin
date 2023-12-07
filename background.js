import { uploadToHalo, fetchImage } from './utils/index.mjs';

let token;
let domain;
let slugify;

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
      let formData;
      try {
        formData = await fetchImage(info, slugify);
      } catch (e) {
        chrome.notifications.create({
          type: 'basic',
          title: 'Halo',
          message: '获取图片失败，fetch不支持改url',
          iconUrl: 'icon.png',
        });
        return;
      }
      try {
        await uploadToHalo(formData, domain, token);
      } catch (e) {
        chrome.notifications.create({
          type: 'basic',
          title: 'Halo',
          message: '上传图片失败',
          iconUrl: 'icon.png',
        });
        return;
      }
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
