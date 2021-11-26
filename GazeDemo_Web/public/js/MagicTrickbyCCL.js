// const { default: swal } = require("sweetalert");

var video_isfull =false;
swal('確認後啟動全螢幕體驗','可辨識商品：汽車, 瓶子, 酒杯, 杯子, 椅子, 沙發, 床, 餐桌, 筆電, 手機。\n\n按\"Enter\"鍵可以進入劇院模式\n','success');
function goFullscreen() {
    // Must be called as a result of user interaction to work
    mf = document.documentElement;
    mf.webkitRequestFullscreen();
    
    mf.style.display="";
}
function VideogoFullscreen(event) {
    if(event.keyCode==0x0D){
        vdo = document.getElementById("vdoplayer");
    vdo.webkitRequestFullscreen();
    vdo.style.zIndex = 5000;
    video_isfull = true;
    
    vdo.style.display="";
    }
}
function fullscreenChanged() {
    if (document.webkitFullscreenElement == null) {
        mf = document.documentElement;
        vdo = document.getElementById("vdoplayer");
        mf.style.display="none";
        vdo.style.display="none";
    }
}
// document.onwebkitfullscreenchange = fullscreenChanged;
document.documentElement.onclick = goFullscreen;
document.onkeydown = VideogoFullscreen;

const player = $('#vdoplayer');

function closeFullscreen() {
    // if (document.exitFullscreen) {
    //     document.exitFullscreen();
    // } else 
    if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
    video_isfull = false;
}

//  toastr
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    'target' : 'body',
    }
