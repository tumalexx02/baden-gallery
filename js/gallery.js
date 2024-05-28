const tabs = document.querySelectorAll('.tabs ul li');
let activeTab = document.querySelector('.tabs ul li.is-active');
const galleryCarousel = document.querySelector('.gallery-carousel');
const container = document.querySelector('.container');
const galleryWrapper = document.querySelector('.gallery-wrapper');
const prevBtn = document.querySelector('.gallery-prev');
const nextBtn = document.querySelector('.gallery-next');
const fullScreenImg = document.querySelector('.fullscreen-photo');
const closeFullscreen = document.querySelector('.close-photo');
const photoPlaceholder = document.querySelector('.photo-placeholder');

let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;
let currentIndex = 0;

const openOnFullScreen = (e) => {
  const photoSrc = e.target.src;
  fullScreenImg.setAttribute("src", photoSrc);
  fullScreenImg.parentElement.classList.remove("photo-placeholder_hidden");
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      fullScreenImg.parentElement.classList.add("photo-placeholder_hidden");
    }
  });
}

const createImageTile = (imgPath) => {
  const li = document.createElement("li");
  li.classList.add('gallery-tile');
  li.style.height = `${container.clientWidth/5}px`;
  li.style.position = 'relative';

  const img = document.createElement("img");
  img.setAttribute("src", imgPath);
  img.setAttribute("draggable", "false");

  li.appendChild(img);

  li.addEventListener('click', (e) => {
    openOnFullScreen(e);
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
      const imagesNames = json[0][tabId];
      imagesNames.forEach(imgName => {
        const newTile = createImageTile(`img/${tabId}/${imgName}`)
        galleryWrapper.appendChild(newTile)
      });
    })
}

const updateTilesHeight = () => {
  const tiles = document.querySelectorAll('.gallery-tile');
  tiles.forEach(tile => {
    tile.style.height = `${container.clientWidth/5}px`;
  });
}

addImagesToWrapper(activeTab.id)
galleryCarousel.style.height = `${container.clientWidth/5}px`;

tabs.forEach(tab => tab.addEventListener('click', () => {
  if (tab !== activeTab) {
    activeTab.classList.remove('is-active');
    tab.classList.add('is-active');
    activeTab = tab;
    addImagesToWrapper(tab.id)
  }
}));

window.addEventListener('resize', () => {
  galleryCarousel.style.height = `${container.clientWidth/5}px`;
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
  fullScreenImg.parentElement.classList.add("photo-placeholder_hidden")
})

// Draggable functionality
const touchStart = (index) => {
  return function(event) {
    isDragging = true;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
    galleryWrapper.classList.add('grabbing');
  }
}

const touchEnd = () => {
  isDragging = false;
  cancelAnimationFrame(animationID);

  const movedBy = currentTranslate - prevTranslate;

  if (movedBy < -50) nextBtn.click();
  if (movedBy > 50) prevBtn.click();

  resetTranslate();
  galleryWrapper.classList.remove('grabbing');
}

const touchMove = (event) => {
  if (isDragging) {
    const currentPosition = getPositionX(event);
    currentTranslate = prevTranslate + Math.max(Math.min(currentPosition - startPos, container.clientWidth/5), -container.clientWidth/5);
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