let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function decodeHTMLEntities(text) {
  const temp = document.createElement("div");
  temp.innerHTML = text;
  return temp.textContent || temp.innerText || "";
}

async function getSongs(folder) {
  currFolder = folder;
  const res = await fetch(`/songs/${folder}/info.json`);
  const data = await res.json();
  songs = data.songs;
  console.log(data);

  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" width="34" src="/img/music.svg" alt="">
        <div class="info"><div>${decodeURIComponent(song)}</div></div>
        <div class="playnow">
          <span style="padding: 8px">Play Now</span>
          <img class="invert" src="/img/play.svg" alt="">
        </div>
      </li>`;
  }

  Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info div").innerText);
    });
  });

  return songs;
}

function playMusic(track, pause = false) {
  const encodedTrack = decodeHTMLEntities(track);
  currentSong.src = `/songs/${currFolder}/${encodedTrack}`;
  if (!pause) {
    currentSong.play();
    play.src = "/img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  const res = await fetch("/songs/albums.json");
  const albums = await res.json();
  const cardContainer = document.querySelector(".card-container");

  cardContainer.innerHTML = "";
  for (const album of albums) {
    const coverPath = `/songs/${album.folder}/cover.jpg`;
    cardContainer.innerHTML += `
      <div data-folder="${album.folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60" fill="none">
            <circle cx="12" cy="12" r="10" fill="#3BE477" />
            <path d="M9.5 11.2V12.8C9.5 14.32 9.5 15.08 9.96 15.39C10.41 15.69 11.03 15.35 12.28 14.67L13.75 13.87C15.25 13.06 16 12.65 16 12C16 11.35 15.25 10.94 13.75 10.13L12.28 9.33C11.03 8.65 10.41 8.31 9.96 8.61C9.5 8.92 9.5 9.68 9.5 11.2Z" fill="currentColor"/>
          </svg>
        </div>
        <img src="${coverPath}" alt="">
        <h2>${album.title}</h2>
        <p>${album.description}</p>
      </div>`;
  }

  Array.from(document.getElementsByClassName("card")).forEach((card) => {
    card.addEventListener("click", async () => {
      songs = await getSongs(card.dataset.folder);
      if (songs.length > 0) playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("Angry_(mood)");
  if (songs.length > 0) playMusic(songs[0], true);
  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = e.offsetX / e.target.getBoundingClientRect().width;
    document.querySelector(".circle").style.left = percent * 100 + "%";
    currentSong.currentTime = currentSong.duration * percent;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    const currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    const index = songs.findIndex(
      (song) => decodeURIComponent(song) === currentTrack
    );
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    const currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    const index = songs.findIndex(
      (song) => decodeURIComponent(song) === currentTrack
    );
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  document.querySelector(".volume > img").addEventListener("click", (e) => {
    const icon = e.target;
    const muted = icon.src.includes("/img/mute.svg");
    if (muted) {
      icon.src = "/img/volume.svg";
      currentSong.volume = document.querySelector(".range input").value / 100;
    } else {
      icon.src = "/img/mute.svg";
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    }
  });
}

main();
