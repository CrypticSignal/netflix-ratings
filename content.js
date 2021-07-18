// focus-trap-wrapper previewModal--wrapper mini-modal has-smaller-buttons
// previewModal--container mini-modal has-smaller-buttons
// previewModal--player_container mini-modal has-smaller-buttons
// videoMerchPlayer--boxart-wrapper

chrome.runtime.onMessage.addListener(() => {
  console.log(namesScraped);
});

const getStorageData = (key) =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, (object) =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(object[key])
    )
  );

const getStorageValues = async () => {
  apiKey = await getStorageData("apiKey");
  ratingSite = await getStorageData("ratingSite");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", getStorageValues);
} else {
  getStorageValues();
}

let namesScraped = [];

const getRatings = async (name, apiKey, ratingSite) => {
  const response = await fetch(`https://www.omdbapi.com/?t=${name}&apikey=${apiKey}`);
  const json = await response.json();

  if (json.Error) {
    console.log(`${name} not found on OMDb.`);
    return;
  }

  namesScraped.push(json);

  let totalScore = 0;

  if (ratingSite === "average") {
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      // Metacritic
      if (score.includes("/100")) {
        metacritic = score;
        score = parseInt(score.slice(0, -4)) / 10;

        // IMDb
      } else if (score.includes("/10")) {
        imdb = score;
        score = parseFloat(score.slice(0, -3));

        // Rotten Tomatoes
      } else if (score.includes("%")) {
        rottenTomatoes = score;
        score = parseInt(score.slice(0, -1)) / 10;
      }
      totalScore += score;
    }
  }
  // Metacritic option chosen.
  else if (ratingSite === "metacritic") {
    if (!json.Ratings.some((e) => e.Source === "Metacritic")) {
      return;
    }
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      if (score.includes("/100")) {
        metacritic = score;
        totalScore = parseInt(score.slice(0, -4)) / 10;
      }
    }
  }
  // IMDb option chosen.
  else if (ratingSite === "imdb") {
    if (!json.Ratings.some((e) => e.Source === "Internet Movie Database")) {
      return;
    }
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      if (score.includes("/100")) {
        continue;
      }
      if (score.includes("/10")) {
        imdb = score;
        totalScore = parseFloat(score.slice(0, -3));
      }
    }
  }
  // Rotten Tomatoes option chosen.
  else if (ratingSite === "tomatoes") {
    if (!json.Ratings.some((e) => e.Source === "Rotten Tomatoes")) {
      return;
    }
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      if (score.includes("%")) {
        rottenTomatoes = score;
        totalScore = parseInt(score.slice(0, -1)) / 10;
      }
    }
  }

  let averageRating = (totalScore / parseInt(json.Ratings.length)).toFixed(2);
  if (ratingSite !== "average") {
    averageRating = totalScore;
  }

  return averageRating;
};

let doneNames = [];

// Callback function to execute when mutations are observed
const callback = async (mutationsList) => {
  // Use a traditional for-loop for IE 11
  for (const mutation of mutationsList) {
    if (mutation.attributeName === "data-ui-tracking-context") {
      //const videoID = mutation.target.outerHTML.split(":")[7].split(",")[0];
      const name = mutation.target.outerText;
      if (name === "" || name.includes("\n")) {
        return;
      }
      if (doneNames.some((element) => element === name)) {
        return;
      }

      doneNames.push(name);

      const averageRating = await getRatings(name, apiKey, ratingSite);

      if (averageRating === undefined) {
        const div = createDiv("N/A");
        mutation.target.appendChild(div);
        return;
      }

      const div = createDiv(averageRating);
      mutation.target.appendChild(div);
    } else if (mutation.target.className === "previewModal--boxart") {
      const name = mutation.target.alt;
      if (doneNames.some((element) => element === name)) {
        return;
      }

      doneNames.push(name);

      const averageRating = await getRatings(name, apiKey, ratingSite);

      if (averageRating === undefined) {
        const div = createDiv("N/A");
        document
          .getElementsByClassName(
            "previewModal--player_container mini-modal has-smaller-buttons"
          )[0]
          .appendChild(div);
        return;
      }

      const div = createDiv(averageRating);

      document
        .getElementsByClassName("previewModal--player_container mini-modal has-smaller-buttons")[0]
        .appendChild(div);
    }
  }
};

const observer = new MutationObserver(callback);

// Options for the observer (which mutations to observe)
const config = { attributes: true, subtree: true, childList: true };

const target = document.getElementsByClassName("netflix-sans-font-loaded")[0];
//const target = document.getElementById("appMountPoint");

// Start observing the target node for configured mutations
observer.observe(target, config);

const createDiv = (divText) => {
  const div = document.createElement("div");
  div.style.width = "50px";
  div.style.height = "50px";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.borderRadius = "50%";
  div.style.background = "red";
  div.style.color = "white";
  div.style.fontSize = "20px";
  div.style.position = "relative";
  div.innerHTML = divText;
  return div;
};
