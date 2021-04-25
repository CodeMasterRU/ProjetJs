export function loadImage(src){ // declaration of functions that load image and json file
    return new Promise((resolve, reject) => {
        const image = new Image 

        image.src = src 
        image.onload = () => resolve(image)
        image.onerror = e => reject(e)
    })
}

export function loadJSON (src){
    return fetch(src).then(x => x.json())
}

export default {
    loadImage,
    loadJSON
}