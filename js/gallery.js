const tabs = document.querySelectorAll('.tabs ul li');
let activeTab = document.querySelector('.tabs ul li.is-active');
const galleryCarousel = document.querySelector('.gallery-carousel');
const container = document.querySelector('.container');
const galleryWrapper = document.querySelector('.gallery-wrapper');
const prevBtn = document.querySelector('.gallery-prev');
const nextBtn = document.querySelector('.gallery-next');

const createImageTile = (imgPath) => {
  const li = document.createElement("li");
  li.classList.add('gallery-tile');
  li.style.height = `${container.clientWidth/5}px`;
  li.style.position = 'relative';

  const dimmer = document.createElement("div");
  dimmer.classList.add('tile-dimmer');

  const button = document.createElement("button");
  button.classList.add('center-button');
  button.style.position = 'absolute';
  button.style.top = '50%';
  button.style.left = '50%';
  button.style.transform = 'translate(-50%, -50%)';
  button.style.background = 'transparent';
  button.style.border = 'none';
  button.style.opacity = '0';
  button.style.pointerEvents = 'none';

  const buttonImg = document.createElement("img");
  buttonImg.setAttribute("src", 'icons/full.svg');
  buttonImg.style.width = '50px';
  buttonImg.style.height = '50px';

  button.appendChild(buttonImg);

  const img = document.createElement("img");
  img.setAttribute("src", imgPath);

  li.appendChild(dimmer);
  li.appendChild(img);
  li.appendChild(button);
  
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
});

prevBtn.addEventListener('click', () => {
  const lastTile = galleryWrapper.lastChild;
  galleryWrapper.prepend(lastTile);
})