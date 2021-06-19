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
    // $('.adjust_bar').removeClass('adjust_bar_hover')
})

// $('.tool_bar').hover(function () {
//     $('.side_bar').toggleClass('side_bar_toggle')
// })
// $('.side_bar').hover(function () {
//     $('.side_bar').addClass('side_bar_toggle')
// })

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

// fix bug (tạm vậy :v)
$('.side_bar').addClass('side_bar_toggle')

//gắn event listener cho từng nút apply thêm class active mỗi khi bấm
var apply_button = document.querySelectorAll('.apply')
console.log(apply_button);
for(let i = 0;i<apply_button.length;i++){
    console.log(1);
    apply_button[i].onclick = function(e){
        e.target.classList.toggle('active')
    }
}
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
var grayscale = document.querySelector('.Grayscale .apply')
console.log(grayscale);


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
        console.log(fileinput.files);
        img.src = buff_file
        // img.src = URL.createObjectURL(fileinput.files[0])
    } else {    
        img.src = document.querySelector('#url').value
        
    }
}
// khi nào img load xong thì chạy init, fix được lỗi width = 0 
img.onload = init


function init(){
    ImgProc = new ImageProcessing(img, '.after_canvas > canvas')
    // ImgProc.brightness(100).apply()
    red.onchange = runPipeline
    green.onchange = runPipeline
    blue.onchange = runPipeline
    brightness.onchange = runPipeline
    threshold.onchange = runPipeline
    grayscale.onclick = runPipeline.bind(grayscale)
 
}

// mỗi khi input thay đổi gì thì chạy hàm này 
function runPipeline (){

    //gắn lại sự kiện onlick toggle ở trên phần giao diện do ở dưới bị ghi đè bởi pipeline
    console.log(this.tagName);
    if(this.tagName == 'A'){
        this.classList.toggle('active')
    }


    let brightnessFilter = Number(brightness.value)
    // let contrastFilter = Number(contrast.value)
    let redFilter = Number(red.value)
    let greenFilter = Number(green.value)
    let blueFilter = Number(blue.value)

    //chạy các hàm ở đây

    if(grayscale.classList.contains('active')){
        console.log('xử lý grayscale');
        ImgProc.grayScale().apply()
    }else{
        ImgProc.brightness(brightnessFilter).apply()
    }
    

}
// runPipeline()
// tạo trước new image, về sau gắn link vào trong hàm save changes

