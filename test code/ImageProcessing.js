// Alt + Z để đọc dễ hơn

// Các bước xử lý ảnh ở trong JS
// B1: Tải ảnh vào web, có thể dùng thẻ img hoặc submit file hoặc tạo object img
// B2: Ta chỉ thao tác, xử lý ảnh qua Canvas API(thẻ canvas), nên phải copy ảnh ở bên ngoài canvas vào canvas qua method loadImg(return data của img theo dạng mảng 1 chiều để về sau làm para cho method filter)
// B3: Thực hiện các phép xử lý ảnh qua các method filter( vd: grayscale,... ) thay đổi dữ liệu của biến local trên object và trả về Object đó để thực hiện bước 4
// B4 :Vẽ ảnh vào canvas qua hàm apply

//lợi ích của chia hướng đối tượng như này: có cấu trúc hơn, dễ đọc (các method đều theo cú pháp ImgProcessing.filters.grayscale.apply và các api đều có thể được tìm thấy trong hàm gắn method -init), dễ sửa

// method Constructor nhận para cần thiết để khởi tạo như tên thẻ img, canvas, các setting của người dùng
// trong constructor có hàm loadImg để copy data vào, và lấy data từ canvas / hàm init để gắn các method filter ở dưới vào obj Filters nhìn cho gọn
// 

class ImageProcessing {
  constructor(imgsrcID, canvasID) {
    this.imgData = null;
    this.filters = {}
    this.imgSrc = document.querySelector('img')
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext('2d');
    // chỉnh size của canvas = size của ảnh gốc
    this.canvas.width = this.imgSrc.naturalWidth;
    this.canvas.height = this.imgSrc.naturalHeight;
    this.loadImg()
    this.init()
  }
  loadImg() {
    // hàm này load img vào canvas và return imgData
    this.ctx.drawImage(this.imgSrc, 0, 0, this.imgSrc.naturalWidth, this.imgSrc.naturalHeight);
    this.imgData = this.ctx.getImageData(0, 0, this.imgSrc.naturalWidth, this.imgSrc.naturalHeight)
    console.log(this.imgData)
  }
  saveIMG(){
    
  }
  init() {
    // gắn các hàm vào filters , để ở đây tạo api luôn
    this.filters.grayScale = this.grayScale
    this.filters.brightness = this.brightness
    this.filters.threshold = this.threshold
    this.filters.convolute = this.convolute
    this.filters.grayBalance = this.grayBalance
  }
  apply() {
    this.ctx.putImageData(this.imgData,  0,0);
  }

  // bind this để bảo function, cái this ở trong function là object Imgprocessing chứ ko phải là CHÍNH CÁI FUNCTION đó và cái Object filters như trong kiểu khai báo brightness(){}
  grayScale = function () {
    // console.log(this.imgData);
    let pixels = this.imgData.data
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      // CIE luminance for the RGB
      // The human eye is bad at seeing red and blue, so we de-emphasize them.
      var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = v
    }
    return this
  }.bind(this)

  brightness = function (adjustment) {
    console.log(this)
    let pixels = this.imgData.data
    for (var i = 0; i < pixels.length; i += 4) {
      pixels[i] += adjustment;
      pixels[i + 1] += adjustment;
      pixels[i + 2] += adjustment;
    }
    return this;
  }.bind(this);

  threshold = function (threshold) {
    let pixels = this.imgData.data
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = v
    }
    return this;
  }.bind(this);

  grayBalance = function (){
    // doi luc phep toan ko dung dc do load fail, f5 lai
    this.filters.grayScale().apply();
    let ImgStatistic = {}; 
    let ImgPDF = [];
    let ImgCDF = [];
    let newImgData = [];
    let pixels = this.imgData.data;
    let totalPixels = pixels.length/4;
    // Thống kê số liệu
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      if(r in ImgStatistic){
        ImgStatistic[r]++;
      }else{
        ImgStatistic[r] = 1;
      }
      
    }
    // Tính pdf
    for (const pixel in ImgStatistic){
      let pdf = ImgStatistic[pixel]/totalPixels;
      // console.log(pdf);
      let object = {
        key: pixel,
        value: pdf,
      }
      ImgPDF.push(object);
    }
    // console.log(ImgPDF);

    // tinh cdf
    for (let i = 0; i < ImgPDF.length;i++ ){
      if(i == 0){
        ImgCDF.push(ImgPDF[i]);
        // chưa push đc hay sao ấy nên lỗi
      }else{
        let object = {
          key : ImgPDF[i].key,
          value : ImgCDF[i-1].value + ImgPDF[i].value,
        }
        ImgCDF.push(object);
      }
    }

    for (let i = 0; i < ImgCDF.length; i++) {
      newImgData[i] = {
        old: ImgCDF[i].key,
        new: ImgCDF[i].value * ImgCDF[ImgCDF.length-1].key
      }
    }
    // return ve anh
    
    for (var i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i+1];
      let b = pixels[i+2];
      for (let j = 0; j < newImgData.length; j++) {
        if(r == newImgData[j].old){
          // if(r == 99){
          //   console.log("OLD: " + r)
          //   console.log("NEW: " + newImgData[j].new);
          // }
          pixels[i] = pixels[i+1] = pixels[i+2] = newImgData[j].new;
        }
      }
    }
    // console.log(ImgCDF);
   console.log("THỐNG KÊ LẠI")
   console.log("STATISTIC:");
   console.log(ImgStatistic);
   console.log("PDF: ");
   console.log(ImgPDF);
   console.log("CDF: ");
   console.log(ImgCDF);
   console.log("New value is:");
   console.log(newImgData);
   console.log("Lưu ảnh:")
   console.log(pixels);

    return this;
  }.bind(this);
  // thuật toán này đ hiểu đại khái hàm này là hàm tích chập nhận ma trận 
  // tham khảo tại đây https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
  convolute = function (weights, opaque) {
    tmpCanvas = document.createElement('canvas');
    tmpCtx = tmpCanvas.getContext('2d');

    var pixels = this.imgData
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var output = Filters.createImageData(w, h);
    var dst = output.data;
    // go through the destination image pixels
    var alphaFac = opaque ? 1 : 0;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y * w + x) * 4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        var r = 0, g = 0, b = 0, a = 0;
        for (var cy = 0; cy < side; cy++) {
          for (var cx = 0; cx < side; cx++) {
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy * sw + scx) * 4;
              var wt = weights[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
              a += src[srcOff + 3] * wt;
            }
          }
        }
        dst[dstOff] = r;
        dst[dstOff + 1] = g;
        dst[dstOff + 2] = b;
        dst[dstOff + 3] = a + alphaFac * (255 - a);
      }
    }
    return this;
  }.bind(this);
   // truyền mặc định tham sô pixels 
}
var x = new ImageProcessing();

// x.filters.brightness(250).apply();
// x.filters.grayBalance().apply();
x.filters.grayScale().apply();
x.filters.grayScale().apply();
x.filters.grayScale().apply();
x.filters.grayScale().apply();

// console.log(x.imgData.data);


// x.filters.threshold(60).apply()
// x.filters.convolute(
// [1 / 9, 1 / 9, 1 / 9,
// 1 / 9, 1 / 9, 1 / 9,
// 1 / 9, 1 / 9, 1 / 9]).apply()

// new ImageProcessing().filters.abd()

// 
