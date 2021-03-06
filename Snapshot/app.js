var link = document.querySelectorAll('.side_bar .nav .nav-item .nav-link')

$('.side_bar .nav .nav-item .nav-link').hover(function () {
    $('.adjust_bar').toggleClass('adjust_bar_hover')
    
})

 link.forEach((el)=>{
     el.addEventListener('mouseover',(e)=>{

         link.forEach((e)=>{
             if (e.classList.contains('nav_link_enter')) {
                  e.classList.remove('nav_link_enter')
             }
             let temp_el = document.querySelector(`#${e.innerHTML}`)
             if (temp_el){
                 temp_el.classList.add('d-none')
             }

         })  

         e.target.classList.add('nav_link_enter')
        //  console.log(e.target.innerHTML);
         if (document.querySelector(`#${e.target.innerHTML}`)){
             document.querySelector(`#${e.target.innerHTML}`).classList.remove('d-none')

         }
    })
 })

$('.adjust_bar').hover(function () {
    // console.log('1');
    $(this).addClass('adjust_bar_hover')
    $('.side_bar').addClass('side_bar_toggle')
    $('.side_bar > *').last().toggleClass('d-none')

})
$('.adjust_bar').mouseleave(function(){
    link.forEach((el)=>{
        if (el.classList.contains('nav_link_enter')) {
            el.classList.remove('nav_link_enter')
        }
    })
    $('.adjust_bar').removeClass('adjust_bar_hover')
})


function Input_update(el) {
    el.parentNode.querySelector('div > span').innerHTML = el.value
}
function Input_change() {

    $('#input_type').change(function () {
        // console.log($(this).val())
        let val = $(this).val()
        inp_type = val;
        if (val == 'file') {
            $('.url').addClass('d-none')
            $('.file').removeClass('d-none')
        } else {
            $('.file').addClass('d-none')
            $('.url').removeClass('d-none')
        }
    })
}

Input_change()
setTimeout(removeLoader,'3700')
function removeLoader() {
    $('.awesomeLoader').fadeOut()
}
// fix bug (tạm vậy :v)
$('.side_bar').addClass('side_bar_toggle')

//gắn event listener cho từng nút apply thêm class active mỗi khi bấm
var apply_button = document.querySelectorAll('.apply')
// console.log(apply_button);
apply_button.forEach((e)=>{
    // console.log(apply_button);
    e.addEventListener("click", function(){
        apply_button.forEach((ele)=>{
            ele.classList.remove('active');
        })
        e.classList.add('active');
        // console.log(e);
    })
})


var before_after = document.querySelectorAll('.apply-bf-at')
// console.log(before_after);
before_after.forEach((e)=>{
    e.addEventListener("click", function(){
        before_after.forEach((ele)=>{
            ele.classList.remove('active');
        })
        e.classList.add('active');
        // console.log(before_after);
    })
})
//-------------------------  Các hàm xử lý ở dưới đây, trên chỉ là giao diện---------------------------------

var fileinput = document.querySelector('#inputGroupFile04')
var inp_type ;
var ImgProc;
var img = new Image()
var buff_file ;

const red = document.getElementById('red')
const green = document.getElementById('green')
const blue = document.getElementById('blue')
const brightness = document.getElementById('brightness')
const threshold = document.getElementById('threshold')
const quality = document.getElementById('Compression')
const constrast = document.getElementById('contrast')
var grayscale = document.querySelector('.Grayscale .apply')
var graybalance = document.querySelector(".Graybalance .apply");
var compress = document.querySelector(".Compress .apply");

var before = document.querySelector(".Before .apply-bf-at");
var after = document.querySelector(".After .apply-bf-at");
var save = document.querySelector(".Save .save-btn");
var saveJPEG = document.querySelector(".Save .save-btn-jpeg");
var uri = null;

var before_canvas = document.querySelector(".pre_canvas");
var after_canvas = document.querySelector(".after_canvas");

var before_red = 0;
var before_green = 0;
var before_blue = 0;
var before_brightness = 0;
var before_threshold = 0;
var before_quality = 0;
var before_contrast = 0
var checkString = "";

saveJPEG.addEventListener('click', ()=>{
    if(uri){
        let link = document.createElement('a');
        link.download = 'download';
        link.href = uri;
        link.click();
        link.delete;
    }
})
save.addEventListener('click', ()=>{
    let canvas = document.querySelector(".after_canvas > canvas");
    let link = document.createElement('a');
    link.download = 'download';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;

})



img.setAttribute('crossOrigin', 'anonymous');

fileinput.onchange = function (e) {
    // console.log(2);
    // If it is valid
    if (e.target.files && e.target.files.item(0)) {
        buff_file = URL.createObjectURL(e.target.files[0])
        // console.log(img.src);
    }
}


function save_inp_changes (){
    // console.log(1);
    if (inp_type == 'file') {
        // console.log(fileinput.files);
        img.src = buff_file
        // img.src = URL.createObjectURL(fileinput.files[0])
    } else {    
        img.src = document.querySelector('#url').value
        
    }

    // set canvas before active// todo
    before.classList.add("active");
    after.classList.remove("active");
    before_canvas.classList.remove("d-none");
    after_canvas.classList.add("d-none");
    $('.modal').modal('hide')
}
// khi nào img load xong thì chạy init, fix được lỗi width = 0 
img.onload = init


function init(){
    // console.log(img);
    ImgProc = new ImageProcessing(img, '.pre_canvas > canvas', ".after_canvas > canvas");
    // ImgProc.brightness(100).apply()
    red.onchange = runPipeline
    green.onchange = runPipeline
    blue.onchange = runPipeline
    brightness.onchange = runPipeline
    threshold.onchange = runPipeline
    grayscale.onclick = runPipeline.bind(grayscale);
    contrast.onchange = runPipeline
    graybalance.onclick = runPipeline.bind(graybalance);
    compress.onclick = runPipeline.bind(compress);
    before.onclick = showCanvas.bind(before);
    after.onclick = showCanvas.bind(after);


    before_brightness = Number(brightness.value);
    before_red = Number(red.value)
    before_blue = Number(blue.value)
    before_green = Number(green.value)
    before_threshold = Number(threshold.value)

}


function showCanvas(){
    if(before.classList.contains("active")){
        before_canvas.classList.remove("d-none");
        after_canvas.classList.add('d-none');
    }
    else if(after.classList.contains("active")){
        after_canvas.classList.remove("d-none");
        before_canvas.classList.add('d-none');
    }
}




// mỗi khi input thay đổi gì thì chạy hàm này 
function runPipeline (){


    let brightnessFilter = Number(brightness.value)
    // let contrastFilter = Number(contrast.value)
    let redFilter = Number(red.value)
    let greenFilter = Number(green.value)
    let blueFilter = Number(blue.value)
    let thresholdFilter = Number(threshold.value)
    let contrastfilter = Number(contrast.value)
    let qlty = Number(quality.value)


    if(compress.classList.contains("active") ){
        if(qlty != before_quality){
            console.log("Encoding ...");
            uri = ImgProc.encoder.encode(qlty);         
            checkString = "compress";
            before_quality = qlty;
        }
        else if(checkString != "compress"){
            console.log("Encoding ...");
            uri = ImgProc.encoder.encode(qlty);         
            checkString = "compress";
            before_quality = qlty;
        }
 
    }
    else if(graybalance.classList.contains("active") && checkString != "graybalance"){
        console.log('xử lý gray balance');
        ImgProc.grayBalance().apply();
        checkString = "graybalance";
    }
    else if(grayscale.classList.contains('active') && checkString != "grayscale"){
        console.log('xử lý grayscale');
        ImgProc.grayScale().apply();
        checkString = "grayscale";
    }else {
        if(redFilter != before_red){
            ImgProc.redScale(redFilter).apply()
            before_red = redFilter;
            checkString = "";
        }
        else if(greenFilter != before_green){
            ImgProc.greenScale(greenFilter).apply()
            before_green = greenFilter;
            checkString = "";
            
        }
        else if(blueFilter != before_blue){
            ImgProc.blueScale(blueFilter).apply()
            before_blue = blueFilter;
            checkString = "";

        }
        else if(brightnessFilter != before_brightness){
            ImgProc.brightness(brightnessFilter).apply()
            before_brightness = brightnessFilter
            checkString = "";

        } else if (thresholdFilter != before_threshold ){
            ImgProc.threshold(thresholdFilter).apply()
            before_threshold = thresholdFilter
            checkString = "";

        }else if (contrastfilter != before_contrast){
            ImgProc.addContrast(contrastfilter).apply();
            before_contrast = contrastfilter;
            checkString = '';
        }
        // console.log("KO 1 cái nào");
    }
    // chạy xong phải chuyển canvas after;

    before.classList.remove("active");
    after.classList.add("active");
    before_canvas.classList.add("d-none");
    after_canvas.classList.remove("d-none");
    apply_button.forEach((ele) => {
        ele.classList.remove('active');
    })

}
console.clear()
// tạo trước new image, về sau gắn link vào trong hàm save changes

