function save_options() {
    var token = document.getElementById('token').value;
    var domain = document.getElementById('domain').value;
    chrome.storage.sync.set({
        haloToken: token,
        haloDomain: domain,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// 使用首选项恢复选择框和复选框状态 
// 存储在 chrome.storage 中。
function restore_options() {
    chrome.storage.sync.get({
        haloToken: '',
        haloDomain: '',
    }, function (items) {
        document.getElementById('token').value = items.haloToken;
        document.getElementById('domain').value = items.haloDomain;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);