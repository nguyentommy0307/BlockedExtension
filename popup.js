function cleanURL(url) {
    let cleaned = url.replace(/(^\w+:|^)\/\//, '');

    cleaned = cleaned.replace(/^www\./, '');

    cleaned = cleaned.split('/')[0];

    return cleaned;
}
function registerBlockRule(domain, id) {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [{
            "id": id,
            "priority": 1,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": `||${domain}`,
                "resourceTypes": ["main_frame", "sub_frame", "xmlhttprequest"]
            }
        }],
        removeRuleIds: []
    });
}

document.getElementById('blockBtn').addEventListener('click', () => {

    const rawSite = document.getElementById('website').value.trim();
    const site = cleanURL(rawSite);
    const reason = document.getElementById('message').value.trim();


    if (site === "") {
        alert("Please enter a website domain to block!");
        return;
    }

    if (reason === "") {
        alert("Please give a reason to stay focused!");
        return;
    }

    const ruleId = Math.floor(Date.now() / 1000)

    const entry = {
        reason: reason,
        id: ruleId
    };

    const dataToStore = {};
    dataToStore[site] = entry;

    chrome.storage.local.set(dataToStore, () => {
        registerBlockRule(site, ruleId);
        document.getElementById('website').value = "";
        document.getElementById('message').value = "";
        loadBlockedSites();
    });

});


document.addEventListener('DOMContentLoaded', loadBlockedSites);

function loadBlockedSites() {
    const listContainer = document.getElementById('blockedList');
    listContainer.innerHTML = '';

    chrome.storage.local.get(null, (items) => {
        for (let domain in items) {
            const data = items[domain];
            createListElement(domain, data.reason, data.id);
        }
    });
}

function createListElement(domain, reason, id) {
    const listContainer = document.getElementById('blockedList');

    const div = document.createElement('div');
    div.className = 'blocked-item';
    div.innerHTML = `
        <div class="item-info">
            <span class="item-domain">${domain}</span>
            <span class="item-reason">${reason}</span>
        </div>
        <button class="unblock-btn" data-id="${id}" data-domain="${domain}">Unblock</button>
    `;

    div.querySelector('.unblock-btn').addEventListener('click', (e) => {
        const domainToUnblock = e.target.getAttribute('data-domain');
        const idToUnblock = parseInt(e.target.getAttribute('data-id'));
        unblockSite(domainToUnblock, idToUnblock);
    });

    listContainer.appendChild(div);
}

function unblockSite(domain, id) {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [],
        removeRuleIds: [id]
    }, () => {
        chrome.storage.local.remove(domain, () => {
            loadBlockedSites();
        });
    });
}