import MEDIA from "./media.js";

const APP = {
  audio: new Audio(),
  currentTrack: 0,
  playlist: document.querySelector(".playlist"),
  init: () => {
    APP.buildPlaylist();
    APP.addDOMListeners();
    APP.addAudioListeners();
    APP.loadCurrentTrack();
    APP.loadTrackTimes();
  },
  addDOMListeners: () => {
    //add event listeners for interface elements
    document
      .querySelector(".controls")
      .addEventListener("click", APP.determineButton);
    document
      .querySelector(".playlist")
      .addEventListener("click", APP.playClickedTrack);
    //Hybrid 4
    document
      .querySelector(".progress")
      .addEventListener("click", APP.progressClick);
    document
      .getElementById("btnShuffle")
      .addEventListener("click", APP.shuffle);
  },
  addAudioListeners: () => {
    //add event listeners for APP.audio
    APP.audio.addEventListener("error", APP.audioError);
    APP.audio.addEventListener("loadedmetadata", APP.loadedmetadata);
    APP.audio.addEventListener("durationchange", APP.durationchange);
    APP.audio.addEventListener("timeupdate", APP.timeupdate);
    APP.audio.addEventListener("play", APP.showPauseButton);
    APP.audio.addEventListener("pause", APP.showPlayButton);
    APP.audio.addEventListener("ended", APP.next);
  },
  buildPlaylist: () => {
    //read the contents of MEDIA and create the playlist

    APP.playlist.innerHTML = MEDIA.map((song) => {
      return `<li class="track__item" data-source="${song.track}">
                <div class="image-and-details">
                    <div class="track__thumb">
                        <img
                            src="./img/${song.thumbnail}"
                            alt="${song.artist} art thumbnail"
                            />
                    </div>
                    <div class="track__details">
                        <p class="track__title">${song.title}</p>
                        <p class="track__artist">${song.artist}</p>
                    </div>
                </div>
                <div class="track__time">
                    <time datetime="">00:00</time>
                </div>
            </li>
                        `;
    }).join("");
  },
  loadCurrentTrack: () => {
    let currentTrack = MEDIA[APP.currentTrack].track;
    APP.audio.src = `./media/${currentTrack}`;
    APP.loadFullArt();
    APP.highlightSelectedTrack();
  },
  loadFullArt: () => {
    let fullArtFile = `./img/${MEDIA[APP.currentTrack].large}`;
    let fullArtElement = document.querySelector(".large-album-art");
    fullArtElement.innerHTML = `
        <img
            class="full-art"
            src="${fullArtFile}"
            alt="${MEDIA[APP.currentTrack].artist} full album art"
            />      
         
    `;
  },
  highlightSelectedTrack: () => {
    let selectedTrack = APP.playlist.children[APP.currentTrack];
    selectedTrack.classList.add("current-track");
  },
  removeHighlight: () => {
    //remove the highlight from the selected track in the playlist, in preparation for the next track to be highlighted
    let selectedTrack = APP.playlist.children[APP.currentTrack];
    selectedTrack.classList.remove("current-track");
  },
  determineButton: (ev) => {
    //see if the button clicked was play or pause or next or previous
    let controlButtonClicked = ev.target.innerHTML;

    if (controlButtonClicked === "play_arrow") {
      //change button to pause and then start playing the song
      APP.startPlay();
    } else if (controlButtonClicked === "pause") {
      //change the button to play and then pause the song
      APP.pausePlay();
    } else if (controlButtonClicked === "skip_next") {
      //next track was clicked
      //play the next track
      APP.next();
    } else if (controlButtonClicked === "skip_previous") {
      //previous track was clicked
      //play the previous track
      APP.previous();
    } else {
      //something that's not any of the buttons was clicked and we do nothing - i.e. you clicked in the space between the buttons
      return;
    }
  },
  showPauseButton() {
    //play event fired
    //show the pause button instead of play button
    let pauseOrPlay = document.getElementById("btnPlay");
    pauseOrPlay.innerHTML = `
      <i class="material-symbols-rounded">pause</i>
      `;
  },
  showPlayButton() {
    //pause event fired
    //show the play button instead of pause button
    let pauseOrPlay = document.getElementById("btnPlay");
    pauseOrPlay.innerHTML = `
      <i class="material-symbols-rounded">play_arrow</i>
      `;
  },
  startPlay() {
    //play the loaded track, start animation of full album art
    if (APP.audio.src) {
      //if something is loaded
      APP.audio.play();

      // let animation = document.querySelector(".full-art");
      // animation.classList.add("animation");
      document.querySelector("body").classList.add("animation");
    } else {
      console.warn("You need to load a track first");
    }
  },
  pausePlay() {
    //pause the loaded track, stop animation of full album art
    APP.audio && APP.audio.pause();
    document.querySelector("body").classList.remove("animation");
    // let animation = document.querySelector(".full-art");
    // animation.classList.remove("animation");
  },

  loadedmetadata(ev) {
    //meta data has been loaded
    //set the current time to 00:00 since it is blank otherwise
    document.querySelector(".current-time").innerHTML = "00:00";
  },
  durationchange(ev) {
    //set total length of track in footer
    let totalTrackLength = APP.convertTimeDisplay(APP.audio.duration);
    document.querySelector(".total-time").textContent = totalTrackLength;
  },
  timeupdate(ev) {
    //take current time of track, convert it to 00:00 style, show it in current time section of footer
    let currentTrackTime = APP.convertTimeDisplay(APP.audio.currentTime);
    document.querySelector(".current-time").textContent = currentTrackTime;

    //Hybrid 4 Code
    APP.progressBar();
  },
  convertTimeDisplay: (seconds) => {
    //convert the seconds parameter to `00:00` style display

    let hours = Math.floor(seconds / 3600);
    let mins = Math.floor(seconds / 60) - hours * 60;
    let secs = Math.floor(seconds % 60);
    let output =
      mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");

    return output;
  },
  audioError(ev) {
    //error in the loading of a track
    console.warn(APP.audio.src, "something went wrong; the song won't load");
  },
  loadTrackTimes() {
    MEDIA.forEach((song) => {
      //create a temporary audio element to open the audio file
      let tempAudio = new Audio(`./media/${song.track}`);
      //listen for the event
      tempAudio.addEventListener("durationchange", (ev) => {
        //update the array item with the duration value
        let duration = ev.target.duration;
        song["duration"] = duration;
        //update the display by finding the playlist item with the matching img src
        //or track title or track id...
        let timeString = APP.convertTimeDisplay(duration);
        document.querySelector(
          `li[data-source="${song.track}"] time`
        ).textContent = timeString;
        //the code below is being accomplished by the 4 lines above...
        // thumbnails.forEach((thumb, index) => {
        //   if (thumb.src.includes(song.thumbnail)) {
        //     //convert the duration in seconds to a 00:00 string
        //     let timeString = APP.convertTimeDisplay(duration);
        //     //update the playlist display for the matching item
        //     thumb.closest(".track__item").querySelector("time").textContent =
        //       timeString;
        //   }
        // });
      });
    });
  },
  next() {
    //next button was clicked
    //OR, the 'ended' event was triggered and we want to play the next song in the array
    //load the next track
    APP.pausePlay(); //stop the current track playing
    APP.removeHighlight(); //remove selected track highlight
    APP.currentTrack++; //increment the value
    //if you're at the last song in the array, go back to the first song
    if (APP.currentTrack >= MEDIA.length) {
      APP.currentTrack = 0;
    }
    //call the function to load the MEDIA[APP.currentTrack] src into APP.audio.src
    //then call your function to play the new track
    APP.loadCurrentTrack();
    APP.startPlay();
  },
  previous() {
    //previous button was clicked
    //load the previous track
    APP.pausePlay(); //stop the current track playing
    APP.removeHighlight(); //remove selected track highlight
    APP.currentTrack--; //decrement the value
    //if current track is less than 0 (you're on track 0 and click previous, setting it to -1), go to last song in the array
    if (APP.currentTrack < 0) {
      APP.currentTrack = MEDIA.length - 1;
    }
    //call the function to load the MEDIA[APP.currentTrack] src into APP.audio.src
    //then call your function to play the new track
    APP.loadCurrentTrack();
    APP.startPlay();
  },
  playClickedTrack(ev) {
    if (ev.target.nodeName === "UL") {
      //you clicked between two of the tracks or in the margin, and not on a track
      //otherwise, this was throwing an error
      return;
    }
    //otherwise you clicked on one of the list items
    //play the track that was clicked in the playlist UL
    let closestLI = ev.target.closest("li");

    let track = closestLI.dataset.source;
    //loop through media array with findIndex()
    let trackIndex = MEDIA.findIndex((song) => song.track === track);
    //stop current track with APP.audio.pause()
    APP.pausePlay();
    //remove currently highlighted track in playlist
    APP.removeHighlight();
    //update APP.currentTrack with new index number
    APP.currentTrack = trackIndex;
    //load the track and start playing
    APP.loadCurrentTrack();
    APP.startPlay();
  },
  //HYBRID 4 CODE
  progressBar() {
    //change progress bar width based on track length and time
    let completed = APP.audio.currentTime / APP.audio.duration;
    let percentageComplete = completed * 100;
    document.querySelector(".played").style.width = `${percentageComplete}vw`;
  },
  progressClick(ev) {
    //clicking on the progress bar to change the track time
    let trackPosition = ev.x / document.querySelector(".progress").clientWidth;
    let percentage = trackPosition * 100;
    document.querySelector(".played").style.width = `${percentage}%`;
    APP.audio.currentTime = APP.audio.duration * trackPosition;
  },
  shuffle(ev) {
    if (!APP.audio.paused) {
      //the track is playing, NOT paused
      //any playing track should stop
      APP.pausePlay();
      //for some reason, calling APP.pausePlay is NOT getting the 'pause' event listener to fire and change the pause control button to switch to play
      //call showPlayButton() here to make sure play button is showing when the playlist is shuffled
      APP.showPlayButton();
    }
    //set the progress bar back to starting position
    document.querySelector(".played").style.width = `0vw`;

    //shuffle the playlist
    MEDIA.shuffle();

    //the first track in the new playlist should automatically be selected
    APP.currentTrack = 0;
    //need to rebuild the playlist, load the current track, and load the track times again
    APP.buildPlaylist();
    APP.loadCurrentTrack();
    APP.loadTrackTimes();
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
