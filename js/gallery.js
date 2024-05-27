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
  
  const img = document.createElement("img");
  img.setAttribute("src", imgPath);

  li.appendChild(img);
  
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