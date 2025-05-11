$(function(){
	
	// gnb 반응형
	$('.gnb-toggle').on('click', function(){
    $('nav.gnb').toggleClass('open');
  });
	
	//gnb_all
	$('.gnb-btn, .close-btn').on('click', function(){
    $('nav.gnb').toggleClass('visible');

  });
	
	
	//tab scroll
	$('.tab_left').on('click',function(){
		$('.tab_ul').stop().animate( { scrollLeft : '-=100' });
	});
	
	$('.tab_right').on('click',function(){
		$('.tab_ul').stop().animate( { scrollLeft : '+=100' });
	});
	
	
	

	//custom scrollbar
	$(window).on("load",function(){
		
		$(".gnb-menu__wrap").mCustomScrollbar({
			scrollButtons:{enable:true},
			theme:"minimal-dark",
			scrollbarPosition:"outside"
		});
	});
	
	$('.hd-user').on('click', function(){
		if($('.dropdown_menu').hasClass('active')){
      $(this).removeClass('active');
			$('.dropdown_menu').removeClass('active').slideUp();
			
		}else{
      $(this).addClass('active');
			$('.dropdown_menu').addClass('active').slideDown();
			
			
		}
	});
	
});


// 메인 열기/닫기 버튼
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.candidate-box__top').forEach(topEl => {
    const pEl = topEl.querySelector('.profile-cont p');
    const btn = topEl.querySelector('.drop-btn');
    if (!pEl || !btn) return;

    // 버튼 초기 숨김
    btn.style.display = 'none';

    const style = window.getComputedStyle(pEl);
    const lineHeight = parseFloat(style.lineHeight);
    const maxH = lineHeight * 3;

    // 3줄 넘으면 초기 collapse 및 버튼 보임
    if (pEl.scrollHeight > maxH) {
      pEl.style.maxHeight = maxH + 'px';
      pEl.style.overflow = 'hidden';
      btn.style.display = 'block';

      btn.addEventListener('click', () => {
        const isCollapsed = !!pEl.style.maxHeight;
        if (isCollapsed) {
          // 펼치기
          pEl.style.maxHeight = '';
          pEl.style.overflow = '';
          btn.classList.add('open');
        } else {
          // 접기
          pEl.style.maxHeight = maxH + 'px';
          pEl.style.overflow = 'hidden';
          btn.classList.remove('open');
        }
      });
    } else {
      // 3줄 이하면 확실히 숨김
      btn.style.display = 'none';
    }
  });
});


// 팝업 열기/닫기
function openPopup(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closePopup(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.classList.remove('show');
    document.body.style.overflow = '';
  }
}	


$(document).ready(function () {
  // selectric 초기화
  $('.select-wrap select').selectric();
});





