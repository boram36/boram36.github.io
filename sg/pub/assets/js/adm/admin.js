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
    const contEl = topEl.querySelector('.profile-cont'); 
    const btn = topEl.querySelector('.drop-btn');
    if (!contEl || !btn) return;

    // 버튼 초기 숨김
    btn.style.display = 'none';

    // li 하나의 line-height 기준으로 3줄 높이 계산
    const firstLi = contEl.querySelector('li');
    if (!firstLi) return;

    const lineHeight = parseFloat(window.getComputedStyle(firstLi).lineHeight);
    const maxH = lineHeight * 3;

    // 실제 높이가 3줄 이상일 경우만 접기 기능 적용
    if (contEl.scrollHeight > maxH) {
      contEl.style.maxHeight = maxH + 'px';
      contEl.style.overflow = 'hidden';
      contEl.style.transition = 'max-height 0.3s ease';
      btn.style.display = 'block';

      btn.addEventListener('click', () => {
        const isCollapsed = contEl.style.maxHeight !== '';
        if (isCollapsed) {
          // 펼치기
          contEl.style.maxHeight = '';
          contEl.style.overflow = '';
          btn.classList.add('open');
        } else {
          // 접기
          contEl.style.maxHeight = maxH + 'px';
          contEl.style.overflow = 'hidden';
          btn.classList.remove('open');
        }
      });
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

  $('select').selectric({
    appendTo: 'body',
  });

});


function checkTableHeight() {
  const tableScrollWrap = document.querySelector('.table-scroll2');
  if (!tableScrollWrap) return;

  const table = tableScrollWrap.querySelector('table');
  if (!table) return;

  // 높이 조건 체크
  if (table.offsetHeight > window.innerHeight * 0.43) {
    tableScrollWrap.classList.add('scroll-enabled');
  } else {
    tableScrollWrap.classList.remove('scroll-enabled');
  }
}

$(document).ready(function () {
  $('.datepicker-here').datepicker({
      autoClose: true,
			onSelect: function (formattedDate, date, inst) {
        inst.hide();
      }
  });
})



