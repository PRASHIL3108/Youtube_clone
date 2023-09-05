const apiKey = "AIzaSyCGMVaHBm6VvbwWIeNhS2Fn0aeDMjdPQig";
const baseUrl = "https://www.googleapis.com/youtube/v3";

const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const videosContainer = document.getElementById("videosContainer");
const mainContainer = document.getElementById("main");

function calculateTheTimeGap(publishTime) {
  let publishDate = new Date(publishTime);
  let currentDate = new Date();
  let secondsGap = (currentDate.getTime() - publishDate.getTime()) / 1000;

  const secondsPerDay = 24 * 60 * 60;
  const secondsPerWeek = 7 * secondsPerDay;
  const secondsPerMonth = 30 * secondsPerDay;
  const secondsPerYear = 365 * secondsPerDay;

  if (secondsGap < secondsPerDay) {
     let value = Math.ceil(secondsGap / (60 * 60));
     if(value==1)  return `${value}hr ago`;
    return `${Math.ceil(secondsGap / (60 * 60))}hrs ago`;
  }
  if (secondsGap < secondsPerWeek) {
    let value = Math.ceil(secondsGap /secondsPerWeek);
    if(value==1)  return `${value}week ago`;
    return `${value} weeks ago`;
  }
  if (secondsGap < secondsPerMonth) {
    let value = Math.ceil(secondsGap /secondsPerMonth);
    if(value==1)  return `${value}month ago`;
    return `${value} months ago`;
  }
  let value = Math.ceil(secondsGap / secondsPerYear);
  if(value==1) return `${value}year ago`;
  return `${value} years ago`;
}

let views = "";
function renderVideosOntoUI(videosList) {
  // videosList will be an array of video objects.
  videosContainer.innerHTML = "";
  videosList.forEach((video) => {
    const videoContainer = document.createElement("div");
    videoContainer.className = "video";
    console.log(video);
    videoContainer.innerHTML = `<img src="${video.snippet.thumbnails.high.url}" class="thumbnail" alt="thumbnail"/>
                                <div class="bottom-container">
                                     <div class="logo-container">
                                       <img class="logo" src="${video.channelLogo}" alt="Channel Logo" />
                                    </div>
                                    <div class="title-container">
                                      <p class="title">${video.snippet.title}</p>
                                      <p class="gray-text">${video.snippet.channelTitle}</p>
                                      <p class="gray-text">${views} views · ${calculateTheTimeGap(video.snippet.publishedAt)}</p>
                                    </div>
                             </div>`;

    videoContainer.addEventListener("click", () => {
        console.log(video.id);
      navigateToVideoDetails(video.id);
    });

    videosContainer.appendChild(videoContainer);
  });
}

async function calculateViews(view){
    let views =  parseInt(view);
    if(views<100){
        return views;
    }
    
    else if(views>=1000 && views<1000000){
        return Math.round(views/1000)+"K";
    }
    return Math.round(views/1000000)+"M";
 }
async function fetchChannelLogo(channelId) {
  const endpoint = `${baseUrl}/channels?key=${apiKey}&id=${channelId}&part=snippet`;

  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    return result.items[0].snippet.thumbnails.default.url;
  } catch (error) {
    alert("Failed to load channel logo for ", channelId);
  }
}
/**
 * this will take videoId and returns the statics of the video.
 */
async function getVideoStatistics(videoId) {
  const endpoint = `${baseUrl}/videos?key=${apiKey}&part=statistics&id=${videoId}`;
  try {
    const response = await fetch(endpoint);
   const result = await response.json();
   return result.items[0].statistics;
  } catch (error) {
    alert("Failed to fetch Statistics for ", videoId);
  }
}


async function fetchSearchResults(searchString) {
  // searchString will the input entered by the user
 // const endpoint = `${baseUrl}/search?key=${apiKey}&q=${searchString}&part=snippet&maxResults=5`;
  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=5&key=${apiKey}`;

  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    for (let i = 0; i < result.items.length; i++) {
      let currentVideoId = result.items[i].id;
      let channelId = result.items[i].snippet.channelId;
      let statistics = await getVideoStatistics(currentVideoId);
      let channelLogo = await fetchChannelLogo(channelId);
       views = await calculateViews(statistics.viewCount)
      result.items[i].statistics = statistics;
      result.items[i].channelLogo = channelLogo;
    }

    renderVideosOntoUI(result.items); 
  } catch (error) {
    alert("Some error occured"+ error);
  }
}
 fetchSearchResults();

searchButton.addEventListener("click", () => {
  const searchValue = searchInput.value;
  fetchSearchResults(searchValue);
});


function navigateToVideoDetails(videoId) {
    //   document.cookie = `id=${videoId}; path=/play-video.html`;
    //   window.location.href = "http://127.0.0.1:5500/play-video.html";
          console.log(mainContainer);
          mainContainer.innerHTML =`<div class="main-content-div">
                                             <div class="play-video" id="playVideoContainer></div>
                                             <div class="comments-container id="commentsContainer"></div>
                                    </div>`;
          loadCurrentVideo(videoId);
    }
function loadCurrentVideo(videoId){
    if (YT) {
      new YT.Player("video-placeholder", {
        height: "300",
        width: "500",
        videoId,
      });
    //   loadComments(videoId);
    }
  }
  
  async function loadComments(videoId) {
    let endpoint = `${baseUrl}/comments?key=${apiKey}&id=${videoId}&maxResults=10&part=snippet`;
  
    const response = await fetch(endpoint);
    const result = await response.json();
     console.log(result);
    result.items.forEach((item) => {
      const repliesCount = item.snippet.totalReplyCount;
      const {
        authorDisplayName,
        textDisplay,
        likeCount,
        authorProfileImageUrl: profileUrl,
        publishedAt,
      } = item.snippet.topLevelComment.snippet;
  
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
      <img src="${profileUrl}" class="author-profile" alt="author profile" />
      <b>${authorDisplayName}</b>
      <p>${textDisplay}</p>`;
      let commentContainer = document.getElementById("commentsContainer");
      commentsContainer.appendChild(div);
    });
  }
