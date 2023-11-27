chrome.contextMenus.onClicked.addListener( async(info)=>await genericOnClick(info));
let token;

chrome.storage.sync.get({
  haloToken: '',
}, function (items) {
  token = items.haloToken
  return items.haloToken
});

async function genericOnClick(info) {
    const res = await fetch(info.srcUrl)
    if(res.status === 200) {
        let blob = await res.blob()
        const formData = new FormData()
        const prefix = new Date()
        // TODO：目前先写成png
        formData.append("file",new File([blob],prefix + 'halo-chrome.png',{type:'image/png'}))
        formData.append("policyName","default-policy")
        const data = await fetch("https://aifengliu.top/apis/api.console.halo.run/v1alpha1/attachments/upload",{
            method:'POST',
            body: formData,
            headers:{
                Authorization:token
            }
        })
        if(data.status === 200){
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
}
chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  chrome.contextMenus.create({
    title: '上传到我的Halo附件',
    contexts:["image"],
    id:"1"
  })
});