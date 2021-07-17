document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);

function save_options() {
  chrome.storage.sync.set(
    {
      apiKey: document.getElementById("api-key").value,
      ratingSite: document.getElementById("site").value,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 750);
    }
  );
}

function restore_options() {
  chrome.storage.sync.get(function (items) {
    items.items.apiKey
      ? (document.getElementById("site").value = items.ratingSite)
      : (document.getElementById("site").value = "<Insert your OMDb API key>");
    document.getElementById("api-key").value = items.apiKey;
    items.ratingSite
      ? (document.getElementById("site").value = items.ratingSite)
      : (document.getElementById("site").value = "average");
  });
}
