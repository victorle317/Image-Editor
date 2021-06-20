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
    constructor(imgsrcID, beforeCanvasID, afterCanvasID) {
        this.imgData = null;
        this.outputData = null;
        this.filters = {}
        // this.imgSrc = document.querySelector('img')
        this.imgSrc = imgsrcID
        this.canvas = document.querySelector(beforeCanvasID);
        this.canvas2 = document.querySelector(afterCanvasID);

        console.log(beforeCanvasID);
        console.log(this.imgSrc.width, this.imgSrc.height);

        this.ctx = this.canvas.getContext('2d');
        this.outCtx = this.canvas2.getContext('2d');
        // chỉnh size của canvas = size của ảnh gốc
        this.canvas.width = this.imgSrc.width;
        this.canvas.height = this.imgSrc.height;

        this.canvas2.width = this.imgSrc.width;
        this.canvas2.height = this.imgSrc.height;

        this.loadImg()
        this.init()
        this.encoder = new this.JPEGEncoder();
    }
    loadImg() {
        // hàm này load img vào canvas và return imgData
        this.ctx.drawImage(this.imgSrc, 0, 0, this.imgSrc.width, this.imgSrc.height);
        this.outCtx.drawImage(this.imgSrc, 0, 0, this.imgSrc.width, this.imgSrc.height);

        this.imgData = this.ctx.getImageData(0, 0, this.imgSrc.width, this.imgSrc.height);
        this.outputData = this.ctx.getImageData(0, 0, this.imgSrc.width, this.imgSrc.height);

        // this.outputData = Object.assign({},this.imgData);

        console.log(this.imgData);
        console.log(this.outputData);
    }
    init() {
        // gắn các hàm vào filters , để ở đây tạo api luôn
        this.filters.redScale = this.redScale;
        this.filters.greenScale = this.redScale;
        this.filters.blueScale = this.redScale;

        this.filters.grayScale = this.grayScale
        this.filters.brightness = this.brightness
        this.filters.threshold = this.threshold
        this.filters.convolute = this.convolute
        this.filters.grayBalance = this.grayBalance
    }
    apply() {
        this.outCtx.putImageData(this.outputData, 0, 0);
    }

    redScale = function (adjustment) {
        // console.log(this)
        let tmp = [...this.imgData.data];
        let output = this.outputData.data;
        for (let i = 0; i < tmp.length; i += 4) {
            tmp[i] += adjustment;
            output[i] = tmp[i];
        }
        // console.log(pixels);
        // console.log(output);
        return this;
    }.bind(this);

    greenScale = function (adjustment) {
        // console.log(this)
        let tmp = [...this.imgData.data];
        let output = this.outputData.data;
        for (let i = 0; i < tmp.length; i += 4) {
            tmp[i+1] += adjustment;
            output[i + 1] = tmp[i + 1];
        }
        // console.log(pixels);
        // console.log(output);
        return this;
    }.bind(this);

    blueScale = function (adjustment) {
        // console.log(this)
        let tmp = [...this.imgData.data];
        let output = this.outputData.data;
        for (let i = 0; i < tmp.length; i += 4) {
            tmp[i + 2] += adjustment;
            output[i + 2] = tmp[i + 2];
        }
        // console.log(pixels);
        // console.log(output);
        return this;
    }.bind(this);


    // bind this để bảo function, cái this ở trong function là object Imgprocessing chứ ko phải là CHÍNH CÁI FUNCTION đó và cái Object filters như trong kiểu khai báo brightness(){}
    grayScale = function () {
        // console.log(this.imgData);
        let pixels = this.imgData.data;
        let output = this.outputData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            output[i] = output[i + 1] = output[i + 2] = v
        }
        return this
    }.bind(this)

    brightness = function (adjustment) {
        console.log(adjustment);
        // console.log(this)
        let pixels = this.imgData.data;
        let tmp = [...this.imgData.data];
        let output = this.outputData.data;
        for (let i = 0; i < tmp.length; i += 4) {
            tmp[i] += adjustment;
            tmp[i + 1] += adjustment;
            tmp[i + 2] += adjustment;
            output[i] = tmp[i];
            output[i + 1] = tmp[i + 1];
            output[i + 2] = tmp[i + 2];
        }
        // console.log(pixels);
        // console.log(output);
        return this;
    }.bind(this);

    threshold = function (threshold) {
        let pixels = this.imgData.data
        let output = this.outputData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            let v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
            output[i] = output[i + 1] = output[i + 2] = v
        }
        return this;
    }.bind(this);

    grayBalance = function () {
        // doi luc phep toan ko dung dc do load fail, f5 lai
        this.filters.grayScale().apply();
        let ImgStatistic = {};
        let ImgPDF = [];
        let ImgCDF = [];
        let newImgData = [];
        let pixels = this.imgData.data;
        let output = this.outputData.data;

        let totalPixels = pixels.length / 4;
        // Thống kê số liệu
        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            if (r in ImgStatistic) {
                ImgStatistic[r]++;
            } else {
                ImgStatistic[r] = 1;
            }

        }
        // Tính pdf
        for (const pixel in ImgStatistic) {
            let pdf = ImgStatistic[pixel] / totalPixels;
            // console.log(pdf);
            let object = {
                key: pixel,
                value: pdf,
            }
            ImgPDF.push(object);
        }
        // console.log(ImgPDF);

        // tinh cdf
        for (let i = 0; i < ImgPDF.length; i++) {
            if (i == 0) {
                ImgCDF.push(ImgPDF[i]);
                // chưa push đc hay sao ấy nên lỗi
            } else {
                let object = {
                    key: ImgPDF[i].key,
                    value: ImgCDF[i - 1].value + ImgPDF[i].value,
                }
                ImgCDF.push(object);
            }
        }

        for (let i = 0; i < ImgCDF.length; i++) {
            newImgData[i] = {
                old: ImgCDF[i].key,
                new: ImgCDF[i].value * ImgCDF[ImgCDF.length - 1].key
            }
        }
        // return ve anh

        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            for (let j = 0; j < newImgData.length; j++) {
                if (r == newImgData[j].old) {
                    // if(r == 99){
                    //   console.log("OLD: " + r)
                    //   console.log("NEW: " + newImgData[j].new);
                    // }
                    output[i] = output[i + 1] = output[i + 2] = newImgData[j].new;
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

        let pixels = this.imgData
        let side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);
        let src = pixels.data;
        let sw = pixels.width;
        let sh = pixels.height;
        // pad output by the convolution matrix
        let w = sw;
        let h = sh;
        let output = Filters.createImageData(w, h);
        let dst = output.data;
        // go through the destination image pixels
        let alphaFac = opaque ? 1 : 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sy = y;
                let sx = x;
                let dstOff = (y * w + x) * 4;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                let r = 0, g = 0, b = 0, a = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        let scy = sy + cy - halfSide;
                        let scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            let srcOff = (scy * sw + scx) * 4;
                            let wt = weights[cy * side + cx];
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

    //nén jpeg
    JPEGEncoder = function (quality) {
        var self = this;
        var fround = Math.round;
        var ffloor = Math.floor;
        var YTable = new Array(64);
        var UVTable = new Array(64);
        var fdtbl_Y = new Array(64);
        var fdtbl_UV = new Array(64);
        var YDC_HT;
        var UVDC_HT;
        var YAC_HT;
        var UVAC_HT;

        var scaleFactors = [1 / (2 * Math.sqrt(2))];
        var arrayC = [];
        var a1;
        var a2;
        var a3;
        var a4;
        var a5;


        var bitcode = new Array(65535);
        var category = new Array(65535);
        var outputfDCTQuant = new Array(64);
        var DU = new Array(64);
        var byteout = [];
        var bytenew = 0;
        var bytepos = 7;

        var YDU = new Array(64);
        var UDU = new Array(64);
        var VDU = new Array(64);
        var clt = new Array(256);

        var currentQuality;

        var ZigZag = [
            0, 1, 5, 6, 14, 15, 27, 28,
            2, 4, 7, 13, 16, 26, 29, 42,
            3, 8, 12, 17, 25, 30, 41, 43,
            9, 11, 18, 24, 31, 40, 44, 53,
            10, 19, 23, 32, 39, 45, 52, 54,
            20, 22, 33, 38, 46, 51, 55, 60,
            21, 34, 37, 47, 50, 56, 59, 61,
            35, 36, 48, 49, 57, 58, 62, 63
        ];

        var std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
        var std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        var std_ac_luminance_nrcodes = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
        var std_ac_luminance_values = [
            0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
            0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
            0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
            0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
            0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16,
            0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
            0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
            0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
            0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
            0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
            0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
            0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
            0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
            0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
            0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
            0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
            0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4,
            0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
            0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea,
            0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
            0xf9, 0xfa
        ];

        var std_dc_chrominance_nrcodes = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
        var std_dc_chrominance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        var std_ac_chrominance_nrcodes = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
        var std_ac_chrominance_values = [
            0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21,
            0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
            0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
            0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
            0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34,
            0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
            0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38,
            0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
            0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
            0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
            0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
            0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
            0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96,
            0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
            0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
            0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
            0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2,
            0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
            0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9,
            0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
            0xf9, 0xfa
        ];

        function initConstantForFDCT() {
            // tạo tính trước sẵn các giá trị để dùng trong 
            // biến đổi cousin rời rạc phiên bản nhanh
            // bởi arai, agui, và naka...
            // thuật toán AAN 
            for (var i = 1; i < 8; i++) {
                let c = Math.cos(i * Math.PI / 16);
                arrayC.push(c);
                scaleFactors.push(1 / (4 * c));
            }
            // mảng arrayC tính từ index 0 mà theo cthuc thì lệch -1 index xuống cho đúng
            a1 = arrayC[3];
            a2 = arrayC[1] - arrayC[5];
            a3 = arrayC[3];
            a4 = arrayC[5] + arrayC[1];
            a5 = arrayC[5];

        }

        function initQuantTables(sf) {
            var YQT = [
                16, 11, 10, 16, 24, 40, 51, 61,
                12, 12, 14, 19, 26, 58, 60, 55,
                14, 13, 16, 24, 40, 57, 69, 56,
                14, 17, 22, 29, 51, 87, 80, 62,
                18, 22, 37, 56, 68, 109, 103, 77,
                24, 35, 55, 64, 81, 104, 113, 92,
                49, 64, 78, 87, 103, 121, 120, 101,
                72, 92, 95, 98, 112, 100, 103, 99
            ];
            // công thức tính bảng lượng tử theo quality, nếu quality = 50 thì bảng YQT coi như giữ nguyên
            // sau khi tính với công thức dưới
            for (var i = 0; i < 64; i++) {
                var t = ffloor((YQT[i] * sf + 50) / 100);
                if (t < 1) {
                    t = 1;
                } else if (t > 255) {
                    t = 255;
                }
                YTable[ZigZag[i]] = t;
            }
            var UVQT = [
                17, 18, 24, 47, 99, 99, 99, 99,
                18, 21, 26, 66, 99, 99, 99, 99,
                24, 26, 56, 99, 99, 99, 99, 99,
                47, 66, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99
            ];
            for (var j = 0; j < 64; j++) {
                var u = ffloor((UVQT[j] * sf + 50) / 100);
                if (u < 1) {
                    u = 1;
                } else if (u > 255) {
                    u = 255;
                }
                UVTable[ZigZag[j]] = u;
            }
            var k = 0;
            for (var row = 0; row < 8; row++) {
                for (var col = 0; col < 8; col++) {
                    fdtbl_Y[k] = YTable[ZigZag[k]];
                    fdtbl_UV[k] = UVTable[ZigZag[k]];
                    k++;
                }
            }
        }

        function computeHuffmanTbl(nrcodes, std_table) {
            // nrcodes: mảng chứa các giá trị mà tổng các giá trị đó sẽ là lần tính 
            // std_table : chiều dài mảng này sẽ bằng tổng giá trị trên
            // bảng std_table truyền vào là các index của bảng huffman, tức 
            // là về sau dựa vào bảng std_table này để ghi vào vị trí như 1,5,2,3,4 kiểu v, ko 
            // theo thứ tự mà theo thứ tự quy định trong std_table

            // var std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];

            // var std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

            var codevalue = 0;
            var pos_in_table = 0;
            var HT = new Array();
            for (var k = 1; k <= 16; k++) {
                for (var j = 1; j <= nrcodes[k]; j++) {
                    HT[std_table[pos_in_table]] = [];
                    HT[std_table[pos_in_table]][0] = codevalue; // giá trị, ví dụ: 0101
                    HT[std_table[pos_in_table]][1] = k; // ví dụ : 5 tức là chứa đc 2^5 kí tự
                    // tăng vị trí trong bảng thôi, vì bảng std_table phản ánh 
                    // vị trí trong bảng huffman, 1 vị trí ko thể có 2 giá trị
                    pos_in_table++;
                    codevalue++;
                }
                codevalue *= 2;
                // sau mỗi lần bit tăng lên, thì giá trị cx nên dịch thêm 1 mũ tức x2
                // vì chẳng hạn 01 mà vào chỗ tính 8 bit thì rất dễ hỏng
            }
            return HT;
        }

        function initHuffmanTbl() {
            // truyền các tiêu chuẩn bảng huffman có được
            // vì có sẵn là do lấy thông tin từ sách
            // các bảng này đã được hình thành là nhờ tập dữ liệu vô cùng
            // lớn của nhiều nơi
            // NCL: bảng có sẵn
            YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values);
            UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values);
            YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values);
            UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values);
            console.log("0xF0 YAC:" + YAC_HT[0xF0])
            console.log("0xF0 uVAC:" + UVAC_HT[0xF0])
            console.log("------------------------------------");
            console.log("YDC_HT");
            console.log(YDC_HT);
            console.log("YAC_HT");
            console.log(YAC_HT);
            console.log("UVDC_HT");
            console.log(UVDC_HT);
            console.log("UVAC_HT");
            console.log(UVAC_HT);
        }

        function initCategoryNumber() {
            var nrlower = 1;
            var nrupper = 2;
            for (var cat = 1; cat <= 15; cat++) {
                //Positive numbers
                // tạo nửa trước nửa lớn hơn
                for (var nr = nrlower; nr < nrupper; nr++) {
                    category[32767 + nr] = cat;
                    bitcode[32767 + nr] = [];
                    bitcode[32767 + nr][1] = cat;
                    bitcode[32767 + nr][0] = nr;
                }
                //Negative numbers
                // tạo nửa sau nửa bé hơn
                for (var nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
                    // vòng for với nrneg âm
                    category[32767 + nrneg] = cat;
                    bitcode[32767 + nrneg] = [];
                    bitcode[32767 + nrneg][1] = cat;
                    bitcode[32767 + nrneg][0] = nrupper - 1 + nrneg;
                }
                nrlower <<= 1;
                nrupper <<= 1;
            }
        }



        // IO functions
        function writeBits(bs) {
            // nhận vào mảng 2 phần tử
            var value = bs[0]; // phần tử đầu là giá trị: ví dụ 15
            var posval = bs[1] - 1;  // phần tử thứ 2 là độ sâu: ví dụ 4
            // => từ 2 cmt trên ta có thể thấy 2^4 chứa 16 giá trị, 15 là 1 trong các giá trị đó
            // => còn nhiều giá trị khác từ 0 đến 15 với độ sâu 4
            while (posval >= 0) {
                // kiểm tra value thuộc khoảng 1 << posval đến (1 << posval + 1) -1
                // ví dụ posval đang là 4 tức là
                // 1 << 4 = 16 vậy là kiểm tra value
                // từ 16 đến 31
                // cx có thể nói
                // đây là kiểm tra value trong khoảng từ (bằng 2^posval đến nhỏ hơn 2^(posval + 1 ))
                if (value & (1 << posval)) {
                    // posval vốn là độ sâu 
                    // 1 << posval là tính ra tổng số giá trị của posval đó có được
                    // ví dụ : 1 << 4 => 2^4 = 16 giá trị
                    bytenew |= (1 << bytepos);

                }
                posval--;
                bytepos--;
                // chỉ ghi writeByte khi bytepos <0
                // bytepos vốn sau 1 lần ghi set thành 7
                // nên là sau 8 bit thì được ghi byte đó
                // ở đây hiểu cứ 8 bit thì đc ghi 1 byte

                if (bytepos < 0) {
                    if (bytenew == 0xFF) {
                        // chỉ là để tránh nhầm lẫn với các marker
                        // vốn có dạng 0xFF và gì đó như CA :0xFFCA chẳng hạn
                        // thì sau khi ghi byte đó phải padding thêm 00 để 
                        // tránh nhầm lẫn, thế thôi
                        writeByte(0xFF);
                        writeByte(0);
                    }
                    else {
                        // khác thì cứ ghi đi ko ai cấm
                        writeByte(bytenew);
                    }
                    bytepos = 7;
                    bytenew = 0;
                }
            }
        }

        function writeByte(value) {
            // value nhận vào giá trị từ 0 đến 255
            // clt chứa bảng mã ascii hay utf16 theo thứ tự từ 0 đến 255
            byteout.push(clt[value]);
        }

        function writeWord(value) {
            // chỉ lưu 2^8 1 lần
            // mà truyền vào là 16 bit
            // nên dịch 8 bit 
            // lưu 8 bit trước
            writeByte((value >> 8) & 0xFF);
            // lưu 8 bit sau
            writeByte((value) & 0xFF);
        }


        function fDCTQuant(data, fdtbl) {
            // có gì không hiểu xem
            // biến đổi dct nhanh
            // https://web.stanford.edu/class/ee398a/handouts/lectures/07-TransformCoding.pdf#page=30
            var d0, d1, d2, d3, d4, d5, d6, d7;
            // xử lí theo hàng
            var dataOff = 0;
            var i;
            for (i = 0; i < 8; ++i) {
                d0 = data[dataOff];
                d1 = data[dataOff + 1];
                d2 = data[dataOff + 2];
                d3 = data[dataOff + 3];
                d4 = data[dataOff + 4];
                d5 = data[dataOff + 5];
                d6 = data[dataOff + 6];
                d7 = data[dataOff + 7];

                // step 1: 
                var tmp0 = d0 + d7;
                var tmp1 = d1 + d6;
                var tmp2 = d2 + d5;
                var tmp3 = d3 + d4;
                var tmp4 = d3 - d4;
                var tmp5 = d2 - d5;
                var tmp6 = d1 - d6;
                var tmp7 = d0 - d7;

                //step 2
                var tmp10 = tmp0 + tmp3;
                var tmp13 = tmp0 - tmp3;
                var tmp11 = tmp1 + tmp2;
                var tmp12 = tmp1 - tmp2;

                // step 3
                data[dataOff] = tmp10 + tmp11;
                data[dataOff + 4] = tmp10 - tmp11;

                var z1 = (tmp12 + tmp13) * a1;
                //step 5
                data[dataOff + 2] = tmp13 + z1;
                data[dataOff + 6] = tmp13 - z1;

                //step 2
                tmp10 = tmp4 + tmp5;
                tmp11 = tmp5 + tmp6;
                tmp12 = tmp6 + tmp7;

                var z5 = (tmp10 - tmp12) * a5;
                var z2 = a2 * tmp10 + z5;
                var z4 = a4 * tmp12 + z5;
                var z3 = tmp11 * a3;

                // step 5
                var z11 = tmp7 + z3;
                var z13 = tmp7 - z3;


                // step6
                data[dataOff + 5] = z13 + z2;
                data[dataOff + 3] = z13 - z2;
                data[dataOff + 1] = z11 + z4;
                data[dataOff + 7] = z11 - z4;

                // dịch tiếp hàng tiếp
                dataOff += 8;
            }

            // xử lí theo cột
            dataOff = 0;
            for (i = 0; i < 8; ++i) {
                d0 = data[dataOff];
                d1 = data[dataOff + 8];
                d2 = data[dataOff + 8 * 2];
                d3 = data[dataOff + 8 * 3];
                d4 = data[dataOff + 8 * 4];
                d5 = data[dataOff + 8 * 5];
                d6 = data[dataOff + 8 * 6];
                d7 = data[dataOff + 8 * 7];

                var tmp0p2 = d0 + d7;
                var tmp7p2 = d0 - d7;
                var tmp1p2 = d1 + d6;
                var tmp6p2 = d1 - d6;
                var tmp2p2 = d2 + d5;
                var tmp5p2 = d2 - d5;
                var tmp3p2 = d3 + d4;
                var tmp4p2 = d3 - d4;

                // step 2
                var tmp10p2 = tmp0p2 + tmp3p2;
                var tmp13p2 = tmp0p2 - tmp3p2;
                var tmp11p2 = tmp1p2 + tmp2p2;
                var tmp12p2 = tmp1p2 - tmp2p2;

                // step 3
                data[dataOff] = tmp10p2 + tmp11p2;
                data[dataOff + 8 * 4] = tmp10p2 - tmp11p2;

                var z1p2 = (tmp12p2 + tmp13p2) * a1;
                // step 5
                data[dataOff + 8 * 2] = tmp13p2 + z1p2;
                data[dataOff + 8 * 6] = tmp13p2 - z1p2;

                // step 2
                tmp10p2 = tmp4p2 + tmp5p2;
                tmp11p2 = tmp5p2 + tmp6p2;
                tmp12p2 = tmp6p2 + tmp7p2;


                var z5p2 = (tmp10p2 - tmp12p2) * a5;
                var z2p2 = a2 * tmp10p2 + z5p2;
                var z4p2 = a4 * tmp12p2 + z5p2;
                var z3p2 = tmp11p2 * a3;
                // step 5
                var z11p2 = tmp7p2 + z3p2;
                var z13p2 = tmp7p2 - z3p2;

                // step 6
                data[dataOff + 8 * 5] = z13p2 + z2p2;
                data[dataOff + 8 * 3] = z13p2 - z2p2;
                data[dataOff + 8 * 1] = z11p2 + z4p2;
                data[dataOff + 8 * 7] = z11p2 - z4p2;

                // cột tiếp theo
                dataOff++;
            }
            var fDCTQuant;
            var k = 0;
            for (var row = 0; row < 8; row++) {
                for (var col = 0; col < 8; col++) {
                    // scale factor 
                    fDCTQuant = (data[k] / fdtbl[k]) * scaleFactors[col] * scaleFactors[row];
                    outputfDCTQuant[k] = fround(fDCTQuant);
                    k++;
                }
            }

            return outputfDCTQuant;
        }

        function writeAPP0() {
            writeWord(0xFFE0); // marker
            writeWord(16); // length
            writeByte(0x4A); // J
            writeByte(0x46); // F
            writeByte(0x49); // I
            writeByte(0x46); // F
            writeByte(0); // = "JFIF",'\0'
            writeByte(1); // versionhi
            writeByte(1); // versionlo
            writeByte(0); // xyunits
            writeWord(1); // xdensity
            writeWord(1); // ydensity
            writeByte(0); // thumbnwidth
            writeByte(0); // thumbnheight
        }

        function writeSOF0(width, height) {
            writeWord(0xFFC0); // marker
            writeWord(17);   // length, truecolor YUV JPG
            writeByte(8);    // precision
            writeWord(height);
            writeWord(width);
            writeByte(3);    // nrofcomponents
            writeByte(1);    // IdY
            writeByte(0x11); // HVY
            writeByte(0);    // QTY
            writeByte(2);    // IdU
            writeByte(0x11); // HVU
            writeByte(1);    // QTU
            writeByte(3);    // IdV
            writeByte(0x11); // HVV
            writeByte(1);    // QTV
        }

        function writeDQT() {
            writeWord(0xFFDB); // marker
            writeWord(132);       // length
            writeByte(0);
            for (var i = 0; i < 64; i++) {
                writeByte(YTable[i]);
            }
            writeByte(1);
            for (var j = 0; j < 64; j++) {
                writeByte(UVTable[j]);
            }
        }

        function writeDHT() {
            writeWord(0xFFC4); // marker
            writeWord(0x01A2); // length

            writeByte(0); // HTYDCinfo
            for (var i = 0; i < 16; i++) {
                writeByte(std_dc_luminance_nrcodes[i + 1]);
            }
            for (var j = 0; j <= 11; j++) {
                writeByte(std_dc_luminance_values[j]);
            }

            writeByte(0x10); // HTYACinfo
            for (var k = 0; k < 16; k++) {
                writeByte(std_ac_luminance_nrcodes[k + 1]);
            }
            for (var l = 0; l <= 161; l++) {
                writeByte(std_ac_luminance_values[l]);
            }

            writeByte(1); // HTUDCinfo
            for (var m = 0; m < 16; m++) {
                writeByte(std_dc_chrominance_nrcodes[m + 1]);
            }
            for (var n = 0; n <= 11; n++) {
                writeByte(std_dc_chrominance_values[n]);
            }

            writeByte(0x11); // HTUACinfo
            for (var o = 0; o < 16; o++) {
                writeByte(std_ac_chrominance_nrcodes[o + 1]);
            }
            for (var p = 0; p <= 161; p++) {
                writeByte(std_ac_chrominance_values[p]);
            }
        }

        function writeSOS() {
            writeWord(0xFFDA); // marker
            writeWord(12); // length
            writeByte(3); // nrofcomponents
            writeByte(1); // IdY
            writeByte(0); // HTY
            writeByte(2); // IdU
            writeByte(0x11); // HTU
            writeByte(3); // IdV
            writeByte(0x11); // HTV
            writeByte(0); // Ss
            writeByte(0x3f); // Se
            writeByte(0); // Bf
        }

        function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
            var EOB = HTAC[0x00];
            var M16zeroes = HTAC[0xF0];
            var pos;
            const I16 = 16;
            const I63 = 63;
            // data từng pixel sau khi FDCT và Quantization
            var DU_DCT = fDCTQuant(CDU, fdtbl);

            //ZigZag lại data
            for (var j = 0; j < 64; ++j) {
                DU[ZigZag[j]] = DU_DCT[j];
            }
            // so sánh 2 dc hiện tại và trước đó
            // DU[0] là dc của hiện tại, DC là dc block trước
            var Diff = DU[0] - DC; DC = DU[0];
            //Encode DC
            if (Diff == 0) {
                writeBits(HTDC[0]); // Diff might be 0
            } else {
                pos = 32767 + Diff;
                writeBits(HTDC[category[pos]]);
                writeBits(bitcode[pos]);
            }
            //Encode ACs : dãy AC là 1 dãy số của ma trận sau khi biến đổi DCT
            // nhưng mà chỉ chứa các phần tử trừ phần tử đầu
            // nên là end0pos = 63
            var end0pos = 63; // was const... which is crazy
            //  đếm các phần tử khác 0
            while (end0pos > 0 && (DU[end0pos] == 0)) {
                // ví dụ như: 1 2 5 53 5 2 6 0 0 0 1 0 0 0 0
                // ở đây có tổng 15 số
                // ví dụ trên thì mình có end0pos = 15
                // nên là khi duyệt xong thì end0pos sẽ là
                // duyệt từ cuối về đầu thì end0pos 11 vì trừ đi 4 con số 0 ở cuối
                end0pos--;
            }
            // sau đó có end0pos chính là số lượng các số trong AC mà khác 0
            if (end0pos == 0) {
                // nếu mà dịch đến hết rồi thì ghi dấu kết thúc End Of Block
                // thường thì dãy AC toàn 0 nên có khi là sẽ vào đây nhiều
                // toàn là 0 nên chả cần dùng huffman encode đoạn dưới nữa mà 
                writeBits(EOB);
                return DC;
            }
            var i = 1;
            var lng;
            // xét i =1 là từ vị trí thứ 2, tức bỏ qua vị trí đầu vì đó là DC
            while (i <= end0pos) {
                // xét duyệt dãy AC từ đầu đến vị trí mà sau đó toàn là số 0
                // cái này là để chuyển đổi huffman với các con số trong khoảng này
                var startpos = i; // gán vị trí xét
                // nếu mà vị trí đó vẫn bằng 0 thì tăng i lên để đếm i 
                for (; (DU[i] == 0) && (i <= end0pos); ++i) { }
                var nrzeroes = i - startpos;
                // nếu nrzeros lớn hơn 16, dịch lại 16 bit để giảm
                if (nrzeroes >= I16) {
                    lng = nrzeroes >> 4;
                    for (var nrmarker = 1; nrmarker <= lng; ++nrmarker)
                        writeBits(M16zeroes);
                    nrzeroes = nrzeroes & 0xF;
                }
                pos = 32767 + DU[i];
                writeBits(HTAC[(nrzeroes << 4) + category[pos]]);
                writeBits(bitcode[pos]);
                i++;
            }
            if (end0pos != I63) {
                writeBits(EOB);
            }
            return DC;
        }

        function initCharLookupTable() {
            var sfcc = String.fromCharCode;
            for (var i = 0; i < 256; i++) { ///// ACHTUNG // 255
                clt[i] = sfcc(i);
            }
        }

        this.encode = function (quality, toRaw) // image data object
        {
            let image = window.ImgProc.imgData;


            var time_start = new Date().getTime();

            if (quality) setQuality(quality);

            // Initialize bit writer
            byteout = new Array();
            bytenew = 0;
            bytepos = 7;

            // Add JPEG headers
            writeWord(0xFFD8); // SOI
            writeAPP0();
            writeDQT();
            writeSOF0(image.width, image.height);
            writeDHT();
            writeSOS();

            // Encode 8x8 macroblocks
            var DCY = 0;
            var DCU = 0;
            var DCV = 0;

            bytenew = 0;
            bytepos = 7;

            this.encode.displayName = "_encode_";

            var imageData = image.data;
            var width = image.width;
            var height = image.height;

            var quadWidth = width * 4;
            var tripleWidth = width * 3;

            var x, y = 0;
            var r, g, b;
            var start, p, col, row, pos;
            while (y < height) {
                x = 0;
                while (x < quadWidth) {
                    start = quadWidth * y + x;
                    p = start;
                    col = -1;
                    row = 0;

                    for (pos = 0; pos < 64; pos++) {
                        row = pos >> 3;// /8
                        col = (pos & 7) * 4; // %8
                        p = start + (row * quadWidth) + col;

                        if (y + row >= height) { // padding bottom
                            p -= (quadWidth * (y + 1 + row - height));
                        }

                        if (x + col >= quadWidth) { // padding right
                            p -= ((x + col) - quadWidth + 4)
                        }

                        r = imageData[p++];
                        g = imageData[p++];
                        b = imageData[p++];

                        // calculate YUV values dynamically
                        YDU[pos] = (((0.29900) * r + (0.58700) * g + (0.11400) * b)) - 128; //-0x80
                        UDU[pos] = (((-0.16874) * r + (-0.33126) * g + (0.50000) * b));
                        VDU[pos] = (((0.50000) * r + (-0.41869) * g + (-0.08131) * b));
                    }

                    DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
                    DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
                    DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
                    x += 32;
                }
                y += 8;
            }

            ////////////////////////////////////////////////////////////////

            // Do the bit alignment of the EOI marker
            if (bytepos >= 0) {
                var fillbits = [];
                fillbits[1] = bytepos + 1;
                fillbits[0] = (1 << (bytepos + 1)) - 1;
                writeBits(fillbits);
            }

            writeWord(0xFFD9); //EOI

            if (toRaw) {
                var len = byteout.length;
                var data = new Uint8Array(len);

                for (var i = 0; i < len; i++) {
                    data[i] = byteout[i].charCodeAt();
                }

                //cleanup
                byteout = [];

                // benchmarking
                var duration = new Date().getTime() - time_start;
                console.log('Encoding time: ' + duration + 'ms');

                return data;
            }
            // console.log(byteout);
            var jpegDataUri = 'data:image/jpeg;base64,' + btoa(byteout.join(''));

            byteout = [];

            // benchmarking
            var duration = new Date().getTime() - time_start;
            console.log('Thời gian nén: ' + duration + 'ms');
            // this.ctx.drawImage(this.imgSrc, 0, 0, this.imgSrc.width, this.imgSrc.height);


            // vẽ lại canvas fake từ uri để lấy data và in ra canvas thật
            let imgCompressed = document.createElement('img');
            imgCompressed.className = "encoder-img"
            imgCompressed.src = jpegDataUri;
            imgCompressed.style.display = "none";
            let cvs2 = document.createElement('canvas');
            cvs2.style.display = "none";
            let myTimeout = setTimeout(() => {
                cvs2.width = imgCompressed.width;
                cvs2.height = imgCompressed.height;
                var ctx2 = cvs2.getContext("2d");
                ctx2.drawImage(imgCompressed, 0, 0);
                let theImgData = (ctx2.getImageData(0, 0, cvs2.width, cvs2.height));
                window.ImgProc.outCtx.putImageData(theImgData, 0, 0);

            }, 1000);
            return jpegDataUri;

        }

        function setQuality(quality) {
            if (quality <= 0) {
                quality = 1;
            }
            if (quality > 100) {
                quality = 100;
            }

            if (currentQuality == quality) return // don't recalc if unchanged

            var sf = 0;
            if (quality < 50) {
                sf = Math.floor(5000 / quality);
            } else {
                sf = Math.floor(200 - quality * 2);
            }

            initQuantTables(sf);
            currentQuality = quality;
            console.log('Chất lượng ảnh: ' + quality + '%');
        }

        function init() {
            var time_start = new Date().getTime();
            if (!quality) quality = 50;
            // Create tables
            initConstantForFDCT()
            initCharLookupTable()
            initHuffmanTbl();
            initCategoryNumber();
            // setQuality(quality);
            var duration = new Date().getTime() - time_start;
            console.log('Khởi tạo mất: ' + duration + 'ms');
        }

        init();

    }.bind(this);

}
// var x = new ImageProcessing();

// x.filters.brightness(15).apply();
// x.filters.grayBalance().apply();
// x.filters.grayScale().apply();

// console.log(x.imgData.data);


// x.filters.threshold(60).apply()
// x.filters.convolute(
// [1 / 9, 1 / 9, 1 / 9,
// 1 / 9, 1 / 9, 1 / 9,
// 1 / 9, 1 / 9, 1 / 9]).apply()

// new ImageProcessing().filters.abd()

// 
