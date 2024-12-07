// const myDiv = document.getElementById("myDiv");
// myDiv.classList.add("newClass");

// Example API endpoint URLs
const API_URLS = {
  audios: "/api/audio/get/count",
  playlists: "/api/playlist/get/count",
  albums: "/api/album/get/count",
  users: "/api/user/get/count",
};

// Function to fetch data
async function fetchCounts() {
  try {
    const [audiosResponse, playlistsResponse, albumsResponse, usersResponse] =
      await Promise.all([
        fetch(API_URLS.audios),
        fetch(API_URLS.playlists),
        fetch(API_URLS.albums),
        fetch(API_URLS.users),
      ]);
    // console.log(audiosResponse);
    // console.log(playlistsResponse);
    // console.log(albumsResponse);
    // console.log(usersResponse);

    if (
      !audiosResponse.ok ||
      !playlistsResponse.ok ||
      !albumsResponse.ok ||
      !usersResponse.ok
    ) {
      throw new Error("Error fetching data");
    }

    const audiosCount = await audiosResponse.json();
    const playlistsCount = await playlistsResponse.json();
    const albumsCount = await albumsResponse.json();
    const usersCount = await usersResponse.json();
    // console.log(audiosCount);
    // console.log(audiosCount);
    // Update the DOM with the fetched counts
    document.getElementById("total-audios").textContent =
      audiosCount.count || 0;
    document.getElementById("total-playlists").textContent =
      playlistsCount.count || 0;
    document.getElementById("total-albums").textContent =
      albumsCount.count || 0;
    document.getElementById("total-users").textContent = usersCount.count || 0;
  } catch (error) {
    console.error("Failed to fetch counts:", error);
  }
}

// Call fetchCounts on page load
window.onload = fetchCounts;
