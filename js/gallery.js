const tabs = document.querySelectorAll('.tabs ul li');
let activeTab = document.querySelector('.tabs ul li.is-active');
const galleryCarousel = document.querySelector('.gallery-carousel');
const container = document.querySelector('.container');
const galleryWrapper = document.querySelector('.gallery-wrapper');
const prevBtn = document.querySelector('.gallery-prev');
const nextBtn = document.querySelector('.gallery-next');
const fullScreenImg = document.querySelector('.fullscreen-photo');
const fullScreenVideo = document.querySelector('.fullscreen-video');
const closeFullscreen = document.querySelector('.close-photo');
const photoPlaceholder = document.querySelector('.photo-placeholder');
const prevFullscreenBtn = document.querySelector('.prev-fullscreen');
const nextFullscreenBtn = document.querySelector('.next-fullscreen');

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

const openOnFullScreen = (tile) => {
  const image = tile.firstChild;

  if (tile.classList.contains("videoTile")) {
    fullScreenImg.classList.add("hidden");
    fullScreenVideo.classList.remove("hidden");

    const videoUrl = tile.getAttribute("data-youtube-link");

    fullScreenVideo.src = videoUrl;

    fullScreenImg.parentElement.classList.remove("photo-placeholder_hidden");
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        fullScreenImg.parentElement.classList.add("photo-placeholder_hidden");
        fullScreenVideo.src = '';
      }
    });
  } else {
    fullScreenVideo.classList.add("hidden");
    fullScreenImg.classList.remove("hidden");

    const photoSrc = image.src;
    fullScreenImg.setAttribute("src", photoSrc);
    fullScreenImg.parentElement.classList.remove("photo-placeholder_hidden");
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        fullScreenImg.parentElement.classList.add("photo-placeholder_hidden");
        fullScreenImg.src = "";
      }
    });
  }

}

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
  const firstTile = galleryWrapper.firstChild;
  galleryWrapper.appendChild(firstTile);
  resetTranslate();
});

prevBtn.addEventListener('click', () => {
  const lastTile = galleryWrapper.lastChild;
  galleryWrapper.prepend(lastTile);
  resetTranslate();
})

closeFullscreen.addEventListener('click', () => {
  photoPlaceholder.classList.add("photo-placeholder_hidden");
  fullScreenVideo.src = '';
})

function isFirstChild(element) {
  return element === element.parentElement.firstElementChild;
}

function isLastChild(element) {
  return element === element.parentElement.lastElementChild;
}

prevFullscreenBtn.addEventListener('click', () => {
  let prevTile = currentTile.previousElementSibling;
  if (!prevTile) {
    prevTile = currentTile.parentElement.lastElementChild;
  }
  currentTile = prevTile;
  openOnFullScreen(prevTile);
  // fullScreenVideo.src = '';
});

nextFullscreenBtn.addEventListener('click', () => {
  let nextTile = currentTile.nextElementSibling;
  if (!nextTile) {
    nextTile = currentTile.parentElement.firstElementChild;
  }
  currentTile = nextTile;
  openOnFullScreen(nextTile);
  // fullScreenVideo.src = '';
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
    if (movedBy < -50) nextBtn.click();
    if (movedBy > 50) prevBtn.click();
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

const setSliderPosition = () => {
  galleryWrapper.style.transform = `translateX(${currentTranslate}px)`;
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
  fullScreenImg.style.transition = 'none'; // Убрать анимацию для плавного перетаскивания
};

const touchFullscreenEnd = () => {
  isFullscreenDragging = false;
  const movedBy = currentFullscreenTranslate - prevFullscreenTranslate;

  if (Math.abs(movedBy) > 10) {
    if (movedBy < -50) {
      // fullScreenImg.style.transition = 'transform 0.3s ease-out'; // Добавить плавную анимацию возврата
      fullScreenImg.style.transform = 'translateX(-100%)';
      nextFullscreenBtn.click();
    }
    if (movedBy > 50) {
      // fullScreenImg.style.transition = 'transform 0.3s ease-out'; // Добавить плавную анимацию возврата
      fullScreenImg.style.transform = 'translateX(100%)';
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
  }
};

const resetFullscreenTranslate = () => {
  currentFullscreenTranslate = 0;
  prevFullscreenTranslate = 0;
  // fullScreenImg.style.transition = 'transform 0.3s ease-out';
  fullScreenImg.style.transform = 'translateX(0)';
};

// Добавление обработчиков событий на fullScreenImg
fullScreenImg.addEventListener('touchstart', touchFullscreenStart);
fullScreenImg.addEventListener('touchend', touchFullscreenEnd);
fullScreenImg.addEventListener('touchmove', touchFullscreenMove);

fullScreenImg.addEventListener('mousedown', touchFullscreenStart);
fullScreenImg.addEventListener('mouseup', touchFullscreenEnd);
fullScreenImg.addEventListener('mouseleave', touchFullscreenEnd);
fullScreenImg.addEventListener('mousemove', touchFullscreenMove);