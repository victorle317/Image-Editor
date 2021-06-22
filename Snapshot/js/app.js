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
    console.log('1');
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
        console.log($(this).val())
        let val = $(this).val()
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