let token;
let domain;
let slugify;
let gNameMode = null;
// 生产uuid的函数
function randomUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// 生成hash值的函数
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function generateFilename(mode) {
  return (
    {
      date: (blob) => Date.now(),
      uuid: (blob) => randomUUID(),
      hash: (blob) => cyrb53(blob),
    }[mode] || ((blob) => Date.now())
  ); // 默认使用时间戳
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  generateConfig();
  // 如果需要回复，可以使用 sendResponse
  sendResponse({ message: 'Hello from background.js!' });
});

chrome.contextMenus.onClicked.addListener(genericOnClick);
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
      gNameMode = generateFilename(slugify);
      if (!token || !domain) {
        chrome.notifications.create({
          type: 'basic',
          title: 'Halo',
          message: '请先填写Halo的Token和域名',
          iconUrl: 'icon.png',
        });
        return;
      }
      const formData = await fetchImage(info);
      await uploadToHalo(formData);
    }
  );
}

async function uploadToHalo(formData) {
  const data = await fetch(
    `${domain}/apis/api.console.halo.run/v1alpha1/attachments/upload`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: token,
      },
    }
  );
  console.log(4, data);
  if (data.status === 200) {
    // TODO：找一个可爱的图片，表示成功
    let options = {
      type: 'basic',
      title: 'Halo',
      message: '图片上传成功',
      iconUrl: 'icon.png',
    };
    chrome.notifications.create(options);
  }
}

function transformTypeToExtension(type) {
  return (
    {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/gif': 'gif',
      'image/avif': 'avif',
      'image/apng': 'apng',
    }[type] || 'png'
  );
}

async function fetchImage(info) {
  const res = await fetch(info.srcUrl);
  if (res.status === 200) {
    let blob = await res.blob();
    const formData = new FormData();
    const filename = gNameMode(blob);
    formData.append(
      'file',
      new File([blob], `${filename}.${transformTypeToExtension(blob.type)}`, {
        type: blob.type,
      })
    );
    formData.append('policyName', 'default-policy');
    return formData;
  }
}

chrome.runtime.onInstalled.addListener(async function () {
  chrome.contextMenus.create({
    title: '上传到我的Halo附件',
    contexts: ['image'],
    id: '1',
  });
});
