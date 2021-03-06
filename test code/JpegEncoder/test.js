function JPEGEncoder(quality) {
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
    
    var scaleFactors = [1/(2*Math.sqrt(2))];
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

    function initConstantForFDCT(){
        // t???o t??nh tr?????c s???n c??c gi?? tr??? ????? d??ng trong 
        // bi???n ?????i cousin r???i r???c phi??n b???n nhanh
        // b???i arai, agui, v?? naka...
        // thu???t to??n AAN 
        for (var i = 1; i < 8; i++) {
            let c = Math.cos(i*Math.PI/16);
            arrayC.push(c);
            scaleFactors.push(1/(4*c));
        }
        // m???ng arrayC t??nh t??? index 0 m?? theo cthuc th?? l???ch -1 index xu???ng cho ????ng
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
        // c??ng th???c t??nh b???ng l?????ng t??? theo quality, n???u quality = 50 th?? b???ng YQT coi nh?? gi??? nguy??n
        // sau khi t??nh v???i c??ng th???c d?????i
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
        // nrcodes: m???ng ch???a c??c gi?? tr??? m?? t???ng c??c gi?? tr??? ???? s??? l?? l???n t??nh 
        // std_table : chi???u d??i m???ng n??y s??? b???ng t???ng gi?? tr??? tr??n
        // b???ng std_table truy???n v??o l?? c??c index c???a b???ng huffman, t???c 
        // l?? v??? sau d???a v??o b???ng std_table n??y ????? ghi v??o v??? tr?? nh?? 1,5,2,3,4 ki???u v, ko 
        // theo th??? t??? m?? theo th??? t??? quy ?????nh trong std_table

        // var std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];

        // var std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        var codevalue = 0;
        var pos_in_table = 0;
        var HT = new Array();
        for (var k = 1; k <= 16; k++) {
            for (var j = 1; j <= nrcodes[k]; j++) {
                HT[std_table[pos_in_table]] = [];
                HT[std_table[pos_in_table]][0] = codevalue; // gi?? tr???, v?? d???: 0101
                HT[std_table[pos_in_table]][1] = k; // v?? d??? : 5 t???c l?? ch???a ??c 2^5 k?? t???
                // t??ng v??? tr?? trong b???ng th??i, v?? b???ng std_table ph???n ??nh 
                // v??? tr?? trong b???ng huffman, 1 v??? tr?? ko th??? c?? 2 gi?? tr???
                pos_in_table++;
                codevalue++;
            }
            codevalue *= 2;
            // sau m???i l???n bit t??ng l??n, th?? gi?? tr??? cx n??n d???ch th??m 1 m?? t???c x2
            // v?? ch???ng h???n 01 m?? v??o ch??? t??nh 8 bit th?? r???t d??? h???ng
        }
        return HT;
    }

    function initHuffmanTbl() {
        // truy???n c??c ti??u chu???n b???ng huffman c?? ???????c
        // v?? c?? s???n l?? do l???y th??ng tin t??? s??ch
        // c??c b???ng n??y ???? ???????c h??nh th??nh l?? nh??? t???p d??? li???u v?? c??ng
        // l???n c???a nhi???u n??i
        // NCL: b???ng c?? s???n
        YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values);
        UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values);
        YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values);
        UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values);
        console.log("0xF0 YAC:" +  YAC_HT[0xF0])
        console.log("0xF0 uVAC:" +  UVAC_HT[0xF0])
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
            // t???o n???a tr?????c n???a l???n h??n
            for (var nr = nrlower; nr < nrupper; nr++) {
                category[32767 + nr] = cat;
                bitcode[32767 + nr] = [];
                bitcode[32767 + nr][1] = cat;
                bitcode[32767 + nr][0] = nr;
            }
            //Negative numbers
            // t???o n???a sau n???a b?? h??n
            for (var nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
                // v??ng for v???i nrneg ??m
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
        // nh???n v??o m???ng 2 ph???n t???
        var value = bs[0]; // ph???n t??? ?????u l?? gi?? tr???: v?? d??? 15
        var posval = bs[1] - 1;  // ph???n t??? th??? 2 l?? ????? s??u: v?? d??? 4
        // => t??? 2 cmt tr??n ta c?? th??? th???y 2^4 ch???a 16 gi?? tr???, 15 l?? 1 trong c??c gi?? tr??? ????
        // => c??n nhi???u gi?? tr??? kh??c t??? 0 ?????n 15 v???i ????? s??u 4
        while (posval >= 0) {
            // ki???m tra value thu???c kho???ng 1 << posval ?????n (1 << posval + 1) -1
            // v?? d??? posval ??ang l?? 4 t???c l??
            // 1 << 4 = 16 v???y l?? ki???m tra value
            // t??? 16 ?????n 31
            // cx c?? th??? n??i
            // ????y l?? ki???m tra value trong kho???ng t??? (b???ng 2^posval ?????n nh??? h??n 2^(posval + 1 ))
            if (value & (1 << posval)) {
                // posval v???n l?? ????? s??u 
                // 1 << posval l?? t??nh ra t???ng s??? gi?? tr??? c???a posval ???? c?? ???????c
                // v?? d??? : 1 << 4 => 2^4 = 16 gi?? tr???
                bytenew |= (1 << bytepos);

            }
            posval--;
            bytepos--;
            // ch??? ghi writeByte khi bytepos <0
            // bytepos v???n sau 1 l???n ghi set th??nh 7
            // n??n l?? sau 8 bit th?? ???????c ghi byte ????
            // ??? ????y hi???u c??? 8 bit th?? ??c ghi 1 byte
            
            if (bytepos < 0) {
                if (bytenew == 0xFF) {
                    // ch??? l?? ????? tr??nh nh???m l???n v???i c??c marker
                    // v???n c?? d???ng 0xFF v?? g?? ???? nh?? CA :0xFFCA ch???ng h???n
                    // th?? sau khi ghi byte ???? ph???i padding th??m 00 ????? 
                    // tr??nh nh???m l???n, th??? th??i
                    writeByte(0xFF);
                    writeByte(0);
                }
                else {
                    // kh??c th?? c??? ghi ??i ko ai c???m
                    writeByte(bytenew);
                }
                bytepos = 7;
                bytenew = 0;
            }
        }
    }

    function writeByte(value) {
        // value nh???n v??o gi?? tr??? t??? 0 ?????n 255
        // clt ch???a b???ng m?? ascii hay utf16 theo th??? t??? t??? 0 ?????n 255
        byteout.push(clt[value]);
    }

    function writeWord(value) {
        // ch??? l??u 2^8 1 l???n
        // m?? truy???n v??o l?? 16 bit
        // n??n d???ch 8 bit 
        // l??u 8 bit tr?????c
        writeByte((value >> 8) & 0xFF);
        // l??u 8 bit sau
        writeByte((value) & 0xFF);
    }


    function fDCTQuant(data, fdtbl) {
        // c?? g?? kh??ng hi???u xem
        // bi???n ?????i dct nhanh
        // https://web.stanford.edu/class/ee398a/handouts/lectures/07-TransformCoding.pdf#page=30
        var d0, d1, d2, d3, d4, d5, d6, d7;
        // x??? l?? theo h??ng
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

            // d???ch ti???p h??ng ti???p
            dataOff += 8; 
        }

        // x??? l?? theo c???t
        dataOff = 0;
        for (i = 0; i < 8; ++i) {
            d0 = data[dataOff];
            d1 = data[dataOff + 8];
            d2 = data[dataOff + 8*2];
            d3 = data[dataOff + 8*3];
            d4 = data[dataOff + 8*4];
            d5 = data[dataOff + 8*5];
            d6 = data[dataOff + 8*6];
            d7 = data[dataOff + 8*7];

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
            data[dataOff + 8*4] = tmp10p2 - tmp11p2;

            var z1p2 = (tmp12p2 + tmp13p2) * a1; 
            // step 5
            data[dataOff + 8*2] = tmp13p2 + z1p2; 
            data[dataOff + 8*6] = tmp13p2 - z1p2;

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
            data[dataOff + 8*5] = z13p2 + z2p2; 
            data[dataOff + 8*3] = z13p2 - z2p2;
            data[dataOff + 8*1] = z11p2 + z4p2;
            data[dataOff + 8*7] = z11p2 - z4p2;

            // c???t ti???p theo
            dataOff++; 
        }
        var fDCTQuant;
        var k = 0;
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                // scale factor 
                fDCTQuant = (data[k]/fdtbl[k]) * scaleFactors[col] * scaleFactors[row];
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
        // data t???ng pixel sau khi FDCT v?? Quantization
        var DU_DCT = fDCTQuant(CDU, fdtbl);

        //ZigZag l???i data
        for (var j = 0; j < 64; ++j) {
            DU[ZigZag[j]] = DU_DCT[j];
        }
        // so s??nh 2 dc hi???n t???i v?? tr?????c ????
        // DU[0] l?? dc c???a hi???n t???i, DC l?? dc block tr?????c
        var Diff = DU[0] - DC; DC = DU[0];
        //Encode DC
        if (Diff == 0) {
            writeBits(HTDC[0]); // Diff might be 0
        } else {
            pos = 32767 + Diff;
            writeBits(HTDC[category[pos]]);
            writeBits(bitcode[pos]);
        }
        //Encode ACs : d??y AC l?? 1 d??y s??? c???a ma tr???n sau khi bi???n ?????i DCT
        // nh??ng m?? ch??? ch???a c??c ph???n t??? tr??? ph???n t??? ?????u
        // n??n l?? end0pos = 63
        var end0pos = 63; // was const... which is crazy
        //  ?????m c??c ph???n t??? kh??c 0
        while (end0pos > 0 && (DU[end0pos] ==0)){
            // v?? d??? nh??: 1 2 5 53 5 2 6 0 0 0 1 0 0 0 0
            // ??? ????y c?? t???ng 15 s???
            // v?? d??? tr??n th?? m??nh c?? end0pos = 15
            // n??n l?? khi duy???t xong th?? end0pos s??? l??
            // duy???t t??? cu???i v??? ?????u th?? end0pos 11 v?? tr??? ??i 4 con s??? 0 ??? cu???i
            end0pos--;
        }
        // sau ???? c?? end0pos ch??nh l?? s??? l?????ng c??c s??? trong AC m?? kh??c 0
        if (end0pos == 0) {
            // n???u m?? d???ch ?????n h???t r???i th?? ghi d???u k???t th??c End Of Block
            // th?????ng th?? d??y AC to??n 0 n??n c?? khi l?? s??? v??o ????y nhi???u
            // to??n l?? 0 n??n ch??? c???n d??ng huffman encode ??o???n d?????i n???a m?? 
            writeBits(EOB); 
            return DC;
        }
        var i = 1;
        var lng;
        // x??t i =1 l?? t??? v??? tr?? th??? 2, t???c b??? qua v??? tr?? ?????u v?? ???? l?? DC
        while (i <= end0pos) {
            // x??t duy???t d??y AC t??? ?????u ?????n v??? tr?? m?? sau ???? to??n l?? s??? 0
            // c??i n??y l?? ????? chuy???n ?????i huffman v???i c??c con s??? trong kho???ng n??y
            var startpos = i; // g??n v??? tr?? x??t
            // n???u m?? v??? tr?? ???? v???n b???ng 0 th?? t??ng i l??n ????? ?????m i 
            for (; (DU[i] == 0) && (i <= end0pos); ++i) { }
            var nrzeroes = i - startpos; 
            // n???u nrzeros l???n h??n 16, d???ch l???i 16 bit ????? gi???m
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

    this.encode = function (image, quality, toRaw) // image data object
    {
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
                    YDU[pos]=((( 0.29900)*r+( 0.58700)*g+( 0.11400)*b))-128; //-0x80
                    UDU[pos]=(((-0.16874)*r+(-0.33126)*g+( 0.50000)*b));
                    VDU[pos]=((( 0.50000)*r+(-0.41869)*g+(-0.08131)*b));
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
        console.log(byteout);
        var jpegDataUri = 'data:image/jpeg;base64,' + btoa(byteout.join(''));

        byteout = [];

        // benchmarking
        var duration = new Date().getTime() - time_start;
        console.log('Th???i gian n??n: ' + duration + 'ms');

        return jpegDataUri
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
        console.log('Ch???t l?????ng ???nh: ' + quality + '%');
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
        console.log('Kh???i t???o m???t: ' + duration + 'ms');
    }

    init();

};
function example(quality) {
    // Pass in an existing image from the page
    var theImg = document.getElementById('testimage');
    // Use a canvas to extract the raw image data
    var cvs = document.createElement('canvas');
    setTimeout(()=>{
        cvs.width = theImg.width;
        cvs.height = theImg.height;
        var ctx = cvs.getContext("2d");
        ctx.drawImage(theImg, 0, 0);
        var theImgData = (ctx.getImageData(0, 0, cvs.width, cvs.height));
        // Encode the image and get a URI back, toRaw is false by default
        var jpegURI = encoder.encode(theImgData, quality);
        var img = document.createElement('img');
        img.src = jpegURI;
        document.body.appendChild(img);
    },1000);

}

let encoder = new JPEGEncoder()
example(10)


// example(50)
/* Example usage. Quality is an int in the range [0, 100]
function example(quality){
    // Pass in an existing image from the page
    var theImg = document.getElementById('testimage');
    // Use a canvas to extract the raw image data
    var cvs = document.createElement('canvas');
    cvs.width = theImg.width;
    cvs.height = theImg.height;
    var ctx = cvs.getContext("2d");
    ctx.drawImage(theImg,0,0);
    var theImgData = (ctx.getImageData(0, 0, cvs.width, cvs.height));
    // Encode the image and get a URI back, toRaw is false by default
    var jpegURI = encoder.encode(theImgData, quality);
    var img = document.createElement('img');
    img.src = jpegURI;
    document.body.appendChild(img);
}
Example usage for getting back raw data and transforming it to a blob.
Raw data is useful when trying to send an image over XHR or Websocket,
it uses around 30% less bytes then a Base64 encoded string. It can
also be useful if you want to save the image to disk using a FileWriter.
NOTE: The browser you are using must support Blobs
function example(quality){
    // Pass in an existing image from the page
    var theImg = document.getElementById('testimage');
    // Use a canvas to extract the raw image data
    var cvs = document.createElement('canvas');
    cvs.width = theImg.width;
    cvs.height = theImg.height;
    var ctx = cvs.getContext("2d");
    ctx.drawImage(theImg,0,0);
    var theImgData = (ctx.getImageData(0, 0, cvs.width, cvs.height));
    // Encode the image and get a URI back, set toRaw to true
    var rawData = encoder.encode(theImgData, quality, true);
    blob = new Blob([rawData.buffer], {type: 'image/jpeg'});
    var jpegURI = URL.createObjectURL(blob);
    var img = document.createElement('img');
    img.src = jpegURI;
    document.body.appendChild(img);
}*/