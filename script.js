const apiKey = "AIzaSyCGMVaHBm6VvbwWIeNhS2Fn0aeDMjdPQig";

const url = "https://www.googleapis.com/youtube/v3/search";

async function fetchVideos() {
  const searchQuery = "";
  const response = await fetch(
    `${url}?key=${apiKey}&q=${searchQuery}&part=snippet&maxResults=20`
  );
  const result = await response.json();
  displayVideo(result);
  result.items.forEach((videoItem) => {
    console.log(videoItem.snippet.description);
  });
}

// fetchVideos();