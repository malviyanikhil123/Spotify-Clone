// Initialize a new audio object for the current song
let currentsong = new Audio();

// Declare variables for songs array and current folder
let songs;
let currfolder;

/**
 * Convert seconds to a formatted string in minutes and seconds
 * @param {number} seconds - The number of seconds to convert
 * @return {string} - The formatted time string in "MM:SS" format
 */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Fetch the list of songs from the given folder
 * @param {string} folder - The folder path to fetch songs from
 * @return {Promise<Array>} - A promise that resolves to an array of song filenames
 */
async function getsong(folder) {
    // Set the current folder
    currfolder = folder;

    // Fetch the contents of the folder
    let a = await fetch(`http://127.0.0.1:5502/${folder}/`);
    let response = await a.text();
    
    // Create a div element to parse the response
    let div = document.createElement("div");
    div.innerHTML = response;
    
    
    
    

    // Get all anchor elements in the response
    let anchorElements = div.getElementsByTagName("a");

    // Initialize an empty array for the songs
    songs = [];
    for (let index = 0; index < anchorElements.length; index++) {
        const element = anchorElements[index];
        // Check if the element is an mp3 file and add it to the songs array
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Select the song list element
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        // Add each song to the song list
        songul.innerHTML = songul.innerHTML + `<li>                    
        <img class="invert" src="svg/audio.svg" alt="">
        <div class="info">
        <div> ${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="svg/playsong.svg" alt="">
        </div>
       </li>`;
    }

    // Add click event listeners to each song list item
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

/**
 * Play the selected music track
 * @param {string} track
 * @param {boolean} [pause=false]
 */
let playmusic = (track, pause = false) => {
    // Set the source of the current song
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        // Play the song if not paused
        currentsong.play();
        play.src = "svg/pause.svg";
    }
    // Update the song info display
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}


//  * Display the list of albums and their songs

async function displayalbums() {
    // Fetch the list of albums
    let a = await fetch(`http://127.0.0.1:5502/songs/`);
    let response = await a.text();
    
    // Create a div element to parse the response
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    
    let cardcontanier = document.querySelector(".cardContanier");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-2)[1]);
            let a = await fetch(`http://127.0.0.1:5502/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            // Add each album to the card container
            cardcontanier.innerHTML = cardcontanier.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="playbutton">
            <img src="svg/playbutton.svg" alt="">
            </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <h4>${response.description}</h4>
        </div>`;
        }
    }

    // Add click event listeners to each album card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsong(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        });
    });
}


//  * Main function to initialize the music player
async function main() {
    // Fetch and play the first song in the "Shubh" album
    await getsong("songs/Shubh");
    playmusic(songs[0], true);
    // Display all albums
    displayalbums();

    // Add event listener to the play button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "svg/pause.svg";
        } else {
            currentsong.pause();
            play.src = "svg/playsong.svg";
        }
    });

    // Update the song time display during playback
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Add event listener to the seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    // Add event listener to the hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add event listener to the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Add event listener to the previous button
    previous.addEventListener("click", () => {
        currentsong.pause();
        console.log("previous clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    // Add event listener to the next button
    next.addEventListener("click", () => {
        currentsong.pause();
        console.log("next clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // Add event listener to the volume range input
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("set volume", e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Add event listener to the volume/mute icon
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

// Call the main function to start the music player
main();
