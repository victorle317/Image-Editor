const JpegEncoder = require('jpeg-compressor')
const encoder = new JpegEncoder();
encoder.readFromBMP('./field.bmp');
encoder.encodeToJPG('./field.jpg', 50);

// node index.js để thấy phép màu :))
// chuyển file field bmp về jpg 
// cái lib encoder này dùng thư viện bmp-js của nodejs (thư viện thuần của nó)
// chọc vào node module thì bỏ phần bmp, vào jpeg compress xem code
// dist là code đã nén (trong này có file js đọc dễ hiểu)