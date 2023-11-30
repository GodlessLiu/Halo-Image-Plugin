let token;
let domain;
chrome.storage.sync.get({
  haloToken: '',
  haloDomain: '',
}, function (items) {
  token = items.haloToken
  domain = items.haloDomain
  // 注册右键菜单
  chrome.contextMenus.onClicked.addListener(async (info) => await genericOnClick(info));
  return items
});

async function genericOnClick(info) {
  if (!token || !domain) {
    chrome.notifications.create({
      type: 'basic',
      title: 'Halo',
      message: '请先填写Halo的Token和域名',
      iconUrl: 'icon.png'
    })
    return
  }
  const formData = await fetchImage(info)
  await uploadToHalo(formData)
}


async function uploadToHalo(formData){
   const data = await fetch(`${domain}/apis/api.console.halo.run/v1alpha1/attachments/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: token
      }
    })
    if (data.status === 200) {
      // TODO：找一个可爱的图片，表示成功
      let options = {
        type: 'basic',
        title: 'Halo',
        message: '图片上传成功',
        iconUrl: 'icon.png'
      };
      chrome.notifications.create(options);
    }
}

function transformTypeToExtension(type) {
  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/apng': 'apng'
  }[type] || 'png'
}

async function fetchImage(info){
  const res = await fetch(info.srcUrl)
  if (res.status === 200) {
    let blob = await res.blob()
    const formData = new FormData()
    const prefix = Date.now()
    formData.append("file", new File([blob], `halo-chrome_${prefix}.${transformTypeToExtension(blob.type)}`, { type: blob.type }))
    formData.append("policyName", "default-policy")
    return formData
   
  }
}
chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  chrome.contextMenus.create({
    title: '上传到我的Halo附件',
    contexts: ["image"],
    id: "1"
  })
});