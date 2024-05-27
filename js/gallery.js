const tabs = document.querySelectorAll('.tabs ul li');
let activeTab = document.querySelector('.tabs ul li.is-active');
const galleryCarousel = document.querySelector('.gallery-carousel');
const container = document.querySelector('.container');
const galleryWrapper = document.querySelector('.gallery-wrapper');

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
      // console.log(json)
      const imagesNames = json[0][tabId];
      imagesNames.forEach(imgName => {
        const newTile = createImageTile(`img/${tabId}/${imgName}`)
        galleryWrapper.appendChild(newTile)
      });
    })
}

addImagesToWrapper(activeTab.id)
galleryCarousel.style.height = `${container.clientWidth/5}px`;

tabs.forEach(tab => tab.addEventListener('click', () => {
  if (tab !== activeTab) {
    activeTab.classList.remove('is-active');
    tab.classList.add('is-active');
    activeTab = tab;
    console.log(tab.id)
    addImagesToWrapper(tab.id)
    // console.log(activeTab.id);
  }
}));

window.addEventListener('resize', () => {
  galleryCarousel.style.height = `${container.clientWidth/5}px`;
})