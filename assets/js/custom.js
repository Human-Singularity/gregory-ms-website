window.onload = function() {
    // make navigation change color
    var img = document.createElement('img');
    var src = document.querySelector('.page-header-image').style.backgroundImage.slice(4, -1).replace(/"/g, "");
    if (src != "") {
        img.setAttribute('src', src)
        img.addEventListener('load', function() {
            var vibrant = new Vibrant(img);
            var swatches = vibrant.swatches()
            let nav = document.querySelector('nav.bg-dynamic')
            if (nav !== null) {
                nav.style.cssText = `background-color:${swatches["Vibrant"].getHex()}`
            }
        });
    } else {
        const navElement = document.querySelector('nav.bg-dynamic');
        if (navElement) {
            navElement.classList.add('bg-primary');
            navElement.classList.remove('navbar-transparent');
            navElement.classList.remove('bg-dynamic');
        }        
    }
};