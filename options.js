document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();
  document.getElementById("save").addEventListener("click", saveOptions);
  document.getElementById("show-list").addEventListener("click", sendMessage);
});

function restoreOptions() {
  chrome.storage.sync.get(function (items) {
    items.apiKey
      ? (document.getElementById("api-key").value = items.apiKey)
      : (document.getElementById("api-key").value = "<Insert your OMDb API key>");
    items.ratingSite
      ? (document.getElementById("site").value = items.ratingSite)
      : (document.getElementById("site").value = "average");
  });
}

function saveOptions() {
  chrome.storage.sync.set(
    {
      apiKey: document.getElementById("api-key").value,
      ratingSite: document.getElementById("site").value,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 750);
    }
  );
}

function sendMessage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" });
  });
}
