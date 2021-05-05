const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = document.querySelector('img')

canvas.width = img.naturalWidth;
canvas.height = img.naturalHeight;


console.log(canvas.width,canvas.height)

console.log(img.width, img.height)
console.log(img.naturalWidth, img.naturalHeight)

var imgdata;
ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
imgdata = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
const pixels = imgdata.data;
    var d = pixels;
    for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2];
        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        d[i] = d[i + 1] = d[i + 2] = v
    }
    

ctx.putImageData(imgdata, 0, 0);



console.log(imgdata.data);
// Set line width

// class chính imageProc có constructor(imgdata)/ hàm init để select lẫn tiền xử lý
// có filter.grayscale,....
