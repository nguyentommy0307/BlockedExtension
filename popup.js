document.getElementById('blockBtn').addEventListener('click', () => {

    const site = document.getElementById('website').value.trim();
    const reason = document.getElementById('message').value.trim();


    if (site === "") {
        alert("Please enter a website domain to block!");
        return;
    }

    if (reason === "") {
        alert("Please give a reason to stay focused!");
        return;
    }

    const dataToStore = {};
    dataToStore[site] = reason;

    chrome.storage.local.set(dataToStore, () => {
        console.log("Success! Saved to storage.");

        document.getElementById('website').value = "";
        document.getElementById('message').value = "";

        alert(`Added ${site} to your block list!`);
    });

});