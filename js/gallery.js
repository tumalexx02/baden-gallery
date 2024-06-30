const tabs = document.querySelectorAll('.gallery-container .tabs ul li');
let activeTab = document.querySelector('.gallery-container .tabs ul li.is-active');
const galleryCarousel = document.querySelector('.baden-gallery-carousel');
const container = document.querySelector('.gallery-container');
const galleryWrapper = document.querySelector('.baden-gallery-wrapper');
const prevBtn = document.querySelector('.baden-gallery-prev');
const nextBtn = document.querySelector('.baden-gallery-next');
const fullScreenImg = document.querySelector('.gallery-fullscreen-photo');
const fullScreenVideo = document.querySelector('.gallery-fullscreen-video');
const closeFullscreen = document.querySelector('.gallery-close-photo');
const photoPlaceholder = document.querySelector('.baden-photo-placeholder');
const prevFullscreenBtn = document.querySelector('.baden-prev-fullscreen');
const nextFullscreenBtn = document.querySelector('.baden-next-fullscreen');

let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;
let currentIndex = 0;
let isSwipe = false;
let isMobile = window.innerWidth < 768;
let activeElementType;
let currentTile;

const sizeOfTile = () => {
  const computedStyle = getComputedStyle(container);
  const containerWidthWithoutPaddings = container.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
  return isMobile ? containerWidthWithoutPaddings/3 : containerWidthWithoutPaddings/5
};

let swipeBarrier = sizeOfTile();

function isVideoUrl(url) {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v'];

  try {
    const urlObj = new URL(url);
    const extension = urlObj.pathname.split('.').pop().toLowerCase();
    return videoExtensions.includes(extension);
  } catch (e) {
    return false;
  }
}

function isImageFileName(fileName) {
  const imageExtensions = ['jpg', 'jpeg', 'png','webp'];

  const extension = fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
}

const preloadAdjacentTiles = () => {
  const nextTile = currentTile.nextElementSibling ? currentTile.nextElementSibling : currentTile.parentElement.firstElementChild;
  const prevTile = currentTile.previousElementSibling ? currentTile.previousElementSibling : currentTile.parentElement.lastElementChild;

  const preloadTile = (tile) => {
    if (tile.classList.contains("videoTile")) {
      const videoUrl = tile.getAttribute("data-youtube-link");
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      videoElement.preload = 'auto';
    } else {
      const imgSrc = tile.firstChild.src;
      const imgElement = new Image();
      imgElement.src = imgSrc;
    }
  };

  preloadTile(nextTile);
  preloadTile(prevTile);
};

// Call preload function whenever a new tile is opened in fullscreen
const openOnFullScreen = (tile) => {
  const image = tile.firstChild;

  if (tile.classList.contains("videoTile")) {
    fullScreenImg.classList.add("hidden");
    fullScreenVideo.classList.remove("hidden");

    const videoUrl = tile.getAttribute("data-youtube-link");

    fullScreenVideo.src = videoUrl;

    fullScreenImg.parentElement.classList.remove("baden-photo-placeholder_hidden");
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        fullScreenImg.parentElement.classList.add("baden-photo-placeholder_hidden");
        fullScreenVideo.src = '';
      }
    });
  } else {
    fullScreenVideo.classList.add("hidden");
    fullScreenImg.classList.remove("hidden");

    const photoSrc = image.src;
    fullScreenImg.setAttribute("src", photoSrc);
    fullScreenImg.parentElement.classList.remove("baden-photo-placeholder_hidden");
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        fullScreenImg.parentElement.classList.add("baden-photo-placeholder_hidden");
        fullScreenImg.src = "";
      }
    });
  }

  preloadAdjacentTiles();  // Preload adjacent tiles
};

const createTile = (imgPath, isVideo, videoUrl) => {
  const li = document.createElement("li");
  li.classList.add('gallery-tile');
  li.style.height = `${sizeOfTile()}px`;
  li.style.position = 'relative';

  const img = document.createElement("img");
  img.setAttribute("src", imgPath);
  img.setAttribute("draggable", "false");

  li.appendChild(img);

  if (isVideo) { 
    li.classList.add('videoTile');

    const iconContainer = document.createElement('div');
    const playIcon = document.createElement('img');
    playIcon.src = "icons/play.svg";
    playIcon.classList.add('playIcon');
    iconContainer.appendChild(playIcon);

    li.appendChild(iconContainer);

    li.setAttribute("data-youtube-link", videoUrl);
  }

  !isSwipe && li.addEventListener('click', (e) => {
    if (!isSwipe) {
      currentTile = li;
      openOnFullScreen(e.target.parentElement);
    }
  });

  return(li)
}

const clearWrapper = () => {
  galleryWrapper.innerHTML = "";
}

const addImagesToWrapper = async (tabId) => {
  clearWrapper();
  fetch('jsons/tabs.json')
    .then(res => res.json())
    .then(json => {
      const tileObjs = json[0][tabId];
      tileObjs.forEach(tileObj => {
        const fileName = tileObj["fileName"];
        const isVideo = tileObj["isVideo"];
        const videoUrl = tileObj["videoUrl"];

        const newTile = createTile(`img/${tabId}/${fileName}`, isVideo, videoUrl);
        galleryWrapper.appendChild(newTile);
      });
    })
}

const updateTilesHeight = () => {
  const tiles = document.querySelectorAll('.gallery-tile');
  tiles.forEach(tile => {
    tile.style.height = `${sizeOfTile()}px`;
  });
}

addImagesToWrapper(activeTab.id)
galleryCarousel.style.height = `${sizeOfTile()}px`;

tabs.forEach(tab => tab.addEventListener('click', () => {
  if (tab !== activeTab) {
    activeTab.classList.remove('is-active');
    tab.classList.add('is-active');
    activeTab = tab;
    addImagesToWrapper(tab.id)
  }
}));

window.addEventListener('resize', () => {
  isMobile = window.innerWidth < 768;
  galleryCarousel.style.height = `${sizeOfTile()}px`;
  swipeBarrier = sizeOfTile();
  updateTilesHeight();
});

nextBtn.addEventListener('click', () => {
  nextBtn.disabled = true;
  galleryWrapper.style.transition = 'transform 0.3s';
  galleryWrapper.style.transform = `translateX(-${sizeOfTile()}px)`;
  
  setTimeout(() => {
    galleryWrapper.style.transition = 'none';
    galleryWrapper.style.transform = 'none';
    const firstTile = galleryWrapper.firstChild;
    galleryWrapper.appendChild(firstTile);
    resetTranslate();
    nextBtn.disabled = false;
  }, 300);
});

prevBtn.addEventListener('click', () => {
  prevBtn.disabled = true;
  galleryWrapper.style.transition = 'transform 0.3s';
  galleryWrapper.style.transform = `translateX(${sizeOfTile()}px)`;

  setTimeout(() => {
    galleryWrapper.style.transition = 'none';
    galleryWrapper.style.transform = 'none';
    const lastTile = galleryWrapper.lastChild;
    galleryWrapper.prepend(lastTile);
    resetTranslate();
    nextBtn.disabled = false;
  }, 300);
});

const animateTranslation = (startTranslate, endTranslate, duration, callback) => {
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentTranslate = startTranslate + (endTranslate - startTranslate) * progress;
    setSliderPosition(currentTranslate);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      callback();
    }
  };

  requestAnimationFrame(animate);
};

const nextDragging = () => {
  const tileWidth = sizeOfTile();
  const duration = (1 - Math.abs(currentTranslate / tileWidth)) * 300;

  animateTranslation(currentTranslate, -tileWidth, duration, () => {
    galleryWrapper.style.transition = 'none';
    galleryWrapper.style.transform = 'none';
    const firstTile = galleryWrapper.firstChild;
    galleryWrapper.appendChild(firstTile);
    resetTranslate();
  });
};

const prevDragging = () => {
  const tileWidth = sizeOfTile();
  const duration = (1 - Math.abs(currentTranslate / tileWidth)) * 300;

  animateTranslation(currentTranslate, tileWidth, duration, () => {
    galleryWrapper.style.transition = 'none';
    galleryWrapper.style.transform = 'none';
    const lastTile = galleryWrapper.lastChild;
    galleryWrapper.prepend(lastTile);
    resetTranslate();
  });
};

closeFullscreen.addEventListener('click', () => {
  photoPlaceholder.classList.add("baden-photo-placeholder_hidden");
  fullScreenVideo.src = '';
})

function isFirstChild(element) {
  return element === element.parentElement.firstElementChild;
}

function isLastChild(element) {
  return element === element.parentElement.lastElementChild;
}

nextFullscreenBtn.addEventListener('click', () => {
  nextFullscreenBtn.disabled = true;
  if (fullScreenImg.style.display !== 'none') {
    fullScreenImg.style.transition = 'transform 0.3s';
    fullScreenImg.style.transform = 'translateX(-200%)';
  } else {
    fullScreenVideo.style.transition = 'transform 0.3s';
    fullScreenVideo.style.transform = 'translateX(-200%)';
  }

  setTimeout(() => {
    let nextTile = currentTile.nextElementSibling;
    if (!nextTile) {
      nextTile = currentTile.parentElement.firstElementChild;
    }
    currentTile = nextTile;
    openOnFullScreen(nextTile);

    if (fullScreenImg.style.display !== 'none') {
      fullScreenImg.style.transition = 'none';
      fullScreenImg.style.transform = 'translateX(200%)';
    } else {
      fullScreenVideo.style.transition = 'none';
      fullScreenVideo.style.transform = 'translateX(200%)';
    }

    setTimeout(() => {
      if (fullScreenImg.style.display !== 'none') {
        fullScreenImg.style.transition = 'transform 0.3s';
        fullScreenImg.style.transform = 'translateX(0%)';
      } else {
        fullScreenVideo.style.transition = 'transform 0.3s';
        fullScreenVideo.style.transform = 'translateX(0%)';
      }
      nextFullscreenBtn.disabled = false;
    }, 50);
  }, 300);
});

prevFullscreenBtn.addEventListener('click', () => {
  prevFullscreenBtn.disabled = true;
  if (fullScreenImg.style.display !== 'none') {
    fullScreenImg.style.transition = 'transform 0.3s';
    fullScreenImg.style.transform = 'translateX(200%)';
  } else {
    fullScreenVideo.style.transition = 'transform 0.3s';
    fullScreenVideo.style.transform = 'translateX(200%)';
  }

  setTimeout(() => {
    let prevTile = currentTile.previousElementSibling;
    if (!prevTile) {
      prevTile = currentTile.parentElement.lastElementChild;
    }
    currentTile = prevTile;
    openOnFullScreen(prevTile);

    if (fullScreenImg.style.display !== 'none') {
      fullScreenImg.style.transition = 'none';
      fullScreenImg.style.transform = 'translateX(-200%)';
    } else {
      fullScreenVideo.style.transition = 'none';
      fullScreenVideo.style.transform = 'translateX(-200%)';
    }

    setTimeout(() => {
      if (fullScreenImg.style.display !== 'none') {
        fullScreenImg.style.transition = 'transform 0.3s';
        fullScreenImg.style.transform = 'translateX(0%)';
      } else {
        fullScreenVideo.style.transition = 'transform 0.3s';
        fullScreenVideo.style.transform = 'translateX(0%)';
      }
      prevFullscreenBtn.disabled = false;
    }, 50);
  }, 300);
});

// Draggable functionality
const touchStart = (index) => {
  return function(event) {
    isDragging = true;
    isSwipe = false;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
    galleryWrapper.classList.add('grabbing');
  }
}

const touchEnd = () => {
  isDragging = false;
  cancelAnimationFrame(animationID);

  const movedBy = currentTranslate - prevTranslate;

  if (Math.abs(movedBy) > 10) {
    isSwipe = true;
    if (movedBy < -50) nextDragging();
    if (movedBy > 50) prevDragging();
  }
  
  resetTranslate();

  galleryWrapper.classList.remove('grabbing');
}

const touchMove = (event) => {
  if (isDragging) {
    const currentPosition = getPositionX(event);
    currentTranslate = prevTranslate + Math.max(Math.min(currentPosition - startPos, swipeBarrier), -swipeBarrier);
    setSliderPosition();
  }
}

const getPositionX = (event) => {
  return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

const animation = () => {
  setSliderPosition();
  if (isDragging) requestAnimationFrame(animation);
}

const setSliderPosition = (newPosition) => {
  galleryWrapper.style.transform = `translateX(${newPosition ?? currentTranslate}px)`;
}

const resetTranslate = () => {
  currentTranslate = 0;
  prevTranslate = 0;
  setSliderPosition();
}

galleryWrapper.addEventListener('mousedown', touchStart(0));
galleryWrapper.addEventListener('mouseup', touchEnd);
galleryWrapper.addEventListener('mouseleave', touchEnd);
galleryWrapper.addEventListener('mousemove', touchMove);

galleryWrapper.addEventListener('touchstart', touchStart(0));
galleryWrapper.addEventListener('touchend', touchEnd);
galleryWrapper.addEventListener('touchmove', touchMove);

// Draggable fullscreen functionality
let startFullscreenPos = 0;
let currentFullscreenTranslate = 0;
let prevFullscreenTranslate = 0;
let isFullscreenDragging = false;

const touchFullscreenStart = (event) => {
  isFullscreenDragging = true;
  startFullscreenPos = getPositionX(event);
  fullScreenImg.style.transition = 'none'; // Remove transition for smooth dragging
  fullScreenVideo.style.transition = 'none';
};

const touchFullscreenEnd = () => {
  isFullscreenDragging = false;
  const movedBy = currentFullscreenTranslate - prevFullscreenTranslate;

  if (Math.abs(movedBy) > 10) {
    if (movedBy < -50) {
      fullScreenImg.style.transition = 'transform 0.3s';
      fullScreenImg.style.transform = 'translateX(-100%)';
      fullScreenVideo.style.transition = 'transform 0.3s';
      fullScreenVideo.style.transform = 'translateX(-100%)';
      nextFullscreenBtn.click();
    }
    if (movedBy > 50) {
      fullScreenImg.style.transition = 'transform 0.3s';
      fullScreenImg.style.transform = 'translateX(100%)';
      fullScreenVideo.style.transition = 'transform 0.3s';
      fullScreenVideo.style.transform = 'translateX(100%)';
      prevFullscreenBtn.click();
    }
  }

  resetFullscreenTranslate();
};

const touchFullscreenMove = (event) => {
  if (isFullscreenDragging) {
    const currentPosition = getPositionX(event);
    currentFullscreenTranslate = prevFullscreenTranslate + currentPosition - startFullscreenPos;
    fullScreenImg.style.transform = `translateX(${currentFullscreenTranslate}px)`;
    fullScreenVideo.style.transform = `translateX(${currentFullscreenTranslate}px)`;
  }
};

const resetFullscreenTranslate = () => {
  currentFullscreenTranslate = 0;
  prevFullscreenTranslate = 0;
  fullScreenImg.style.transition = 'transform 0.3s';
  fullScreenImg.style.transform = 'translateX(0)';
  fullScreenVideo.style.transition = 'transform 0.3s';
  fullScreenVideo.style.transform = 'translateX(0)';
};

fullScreenImg.addEventListener('touchstart', touchFullscreenStart);
fullScreenImg.addEventListener('touchend', touchFullscreenEnd);
fullScreenImg.addEventListener('touchmove', touchFullscreenMove);

fullScreenImg.addEventListener('mousedown', touchFullscreenStart);
fullScreenImg.addEventListener('mouseup', touchFullscreenEnd);
fullScreenImg.addEventListener('mouseleave', touchFullscreenEnd);
fullScreenImg.addEventListener('mousemove', touchFullscreenMove);

fullScreenVideo.addEventListener('touchstart', touchFullscreenStart);
fullScreenVideo.addEventListener('touchend', touchFullscreenEnd);
fullScreenVideo.addEventListener('touchmove', touchFullscreenMove);

fullScreenVideo.addEventListener('mousedown', touchFullscreenStart);
fullScreenVideo.addEventListener('mouseup', touchFullscreenEnd);
fullScreenVideo.addEventListener('mouseleave', touchFullscreenEnd);
fullScreenVideo.addEventListener('mousemove', touchFullscreenMove);