// focus-trap-wrapper previewModal--wrapper mini-modal has-smaller-buttons
// previewModal--container mini-modal has-smaller-buttons
// previewModal--player_container mini-modal has-smaller-buttons
// videoMerchPlayer--boxart-wrapper

async function getRatings(name, apiKey, ratingSite) {
  const response = await fetch(`https://www.omdbapi.com/?t=${name}&apikey=${apiKey}`);
  const json = await response.json();

  if (json.Error) {
    console.log(`${name} not found on OMDb.`);
    return;
  }

  console.log(json);

  let totalScore = 0;

  if (ratingSite === "average") {
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      // Metacritic
      if (score.includes("/100")) {
        metacritic = score;
        console.log(`Metacritic: ${score}`);
        score = parseInt(score.slice(0, -4)) / 10;

        // IMDb
      } else if (score.includes("/10")) {
        imdb = score;
        console.log(`IMDb: ${score}`);
        score = parseFloat(score.slice(0, -3));

        // Rotten Tomatoes
      } else if (score.includes("%")) {
        rottenTomatoes = score;
        console.log(`Rotten Tomatoes: ${score}`);
        score = parseInt(score.slice(0, -1)) / 10;
      }
      totalScore += score;
    }
  }
  // Metacritic option chosen.
  else if (ratingSite === "metacritic") {
    if (!json.Ratings.some((e) => e.Source === "Metacritic")) {
      console.log("No rating found on Metacritic.");
      return;
    }
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      if (score.includes("/100")) {
        metacritic = score;
        console.log(`Metacritic: ${score}`);
        totalScore = parseInt(score.slice(0, -4)) / 10;
      }
    }
  }
  // IMDb option chosen.
  else if (ratingSite === "imdb") {
    if (!json.Ratings.some((e) => e.Source === "Internet Movie Database")) {
      console.log("No rating found on IMDb.");
      return;
    }
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      if (score.includes("/100")) {
        continue;
      }
      if (score.includes("/10")) {
        imdb = score;
        console.log(`IMDb: ${score}`);
        totalScore = parseFloat(score.slice(0, -3));
      }
    }
  }
  // Rotten Tomatoes option chosen.
  else if (ratingSite === "tomatoes") {
    if (!json.Ratings.some((e) => e.Source === "Rotten Tomatoes")) {
      console.log("No rating found on Rotten Tomatoes.");
      return;
    }
    for (i = 0; i < json.Ratings.length; i++) {
      let score = json.Ratings[i].Value;
      if (score.includes("%")) {
        rottenTomatoes = score;
        console.log(`Rotten Tomatoes: ${score}`);
        totalScore = parseInt(score.slice(0, -1)) / 10;
      }
    }
  }

  let averageRating = (totalScore / parseInt(json.Ratings.length)).toFixed(2);
  if (ratingSite === "average") {
    console.log(`Average = ${totalScore} / ${json.Ratings.length} = ${averageRating}`);
  } else {
    averageRating = totalScore;
  }

  return averageRating;
}

previousName = null;

let movieName = "";
let previousRatingSite = "";

// Callback function to execute when mutations are observed
const callback = async (mutationsList) => {
  // Use a traditional for-loop for IE 11
  for (const mutation of mutationsList) {
    if (mutation.target.className === "previewModal--boxart") {
      if (mutation.target.alt === previousName) {
        return;
      }

      movieName = mutation.target.alt;
      previousName = movieName;

      const getStorageData = (key) =>
        new Promise((resolve, reject) =>
          chrome.storage.sync.get(key, (object) =>
            chrome.runtime.lastError
              ? reject(Error(chrome.runtime.lastError.message))
              : resolve(object[key])
          )
        );

      const apiKey = await getStorageData("apiKey");
      const ratingSite = await getStorageData("ratingSite");
      previousRatingSite = ratingSite;

      const averageRating = await getRatings(movieName, apiKey, ratingSite);

      if (averageRating === undefined) {
        return;
      }

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
      div.innerHTML = averageRating;

      document.getElementsByClassName("videoMerchPlayer--boxart-wrapper")[0].appendChild(div);
    }
  }
};

const observer = new MutationObserver(callback);

// Options for the observer (which mutations to observe)
const config = { attributes: true, subtree: true };

const target = document.getElementsByClassName("netflix-sans-font-loaded")[0];

// Start observing the target node for configured mutations
observer.observe(target, config);
