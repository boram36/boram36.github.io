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


let popupIndex = 0;
const popupResizeListeners = new Map();

function openPopup(url, width, height = null, isDelete = false, sizeClass = '') {
  popupIndex++;
  const popupId = `layerPopup_${popupIndex}`;
  const wrapId = `popupWrap_${popupIndex}`;
  const iframeId = `popupIframe_${popupIndex}`;

  // 팝업 DOM 생성
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.id = popupId;

  popup.innerHTML = `
    <div class="popup-overlay" onclick="closePopup('${popupId}')"></div>
    <div class="popup-wrap ${sizeClass}" id="${wrapId}" style="width: ${width}px; ${height ? `height:${height}px;` : ''}">
      ${!isDelete ? `<button type="button" class="btn-close ico" onclick="closePopup('${popupId}')"><i class="ico-cancel"></i></button>` : ''}
      <iframe id="${iframeId}" src="${url}" frameborder="0" width="100%" height="100%"></iframe>
    </div>
  `;

  document.body.appendChild(popup);
  popup.style.display = 'flex';

  const iframe = document.getElementById(iframeId);

  // 메시지 수신 처리
  function receivePopupSizeMessage(event) {
    if (!event.data || typeof event.data !== 'object') return;
    const { popupHeight, popupTargetId } = event.data;

    if (popupTargetId === popupId && popupHeight) {
      document.getElementById(wrapId).style.height = popupHeight + 'px';
    }
  }

  // 메시지 리스너 등록 (중복 방지용)
  window.addEventListener('message', receivePopupSizeMessage, false);

  // iframe 로드 후 viewport 전달
  const sendViewportToIframe = () => {
    try {
      iframe.contentWindow?.postMessage({ viewportWidth: window.innerWidth, popupTargetId: popupId }, '*');
    } catch (e) {
      console.warn('iframe 메시지 전송 실패:', e);
    }
  };

  iframe.onload = sendViewportToIframe;

  // 리사이즈 시 전달 (리스너 보관)
  popupResizeListeners.set(popupId, sendViewportToIframe);
  window.addEventListener('resize', sendViewportToIframe);
}

// 닫기 함수
function closePopup(popupId = 'layerPopup') {
  const popup = document.getElementById(popupId);
  if (!popup) return;

  const iframe = popup.querySelector('iframe');
  const wrap = popup.querySelector('.popup-wrap');

  iframe.src = '';
  wrap.removeAttribute('style');
  popup.style.display = 'none';

  window.removeEventListener('message', receivePopupSizeMessage);
}



// iframe 내부에서 부모에게 높이 전달
function receivePopupSizeMessage(event) {
  if (!event.data || typeof event.data !== 'object') return;
  const { popupHeight } = event.data;
  if (popupHeight) {
    document.getElementById('popupWrap').style.height = popupHeight + 'px';
  }
}

// 검색 팝업
function openSearch() {
  const el = document.getElementById('searchPopup');
  if (window.innerWidth <= 1280) {
    el.classList.add('active');
  }
}

function closeSearch() {
  document.getElementById('searchPopup').classList.remove('active');
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


document.addEventListener('DOMContentLoaded', function () {
  const tdCont = document.querySelector('.td_cont');
  const tblCut = document.querySelectorAll('.table td .tbl-cut');

  if (tdCont && tblCut.length > 0) {
    // 클래스 이름에서 'width-'로 시작하는 부분 찾기
    const widthClass = Array.from(tdCont.classList).find(cls => cls.startsWith('width-'));
    
    if (widthClass) {
      const widthValue = widthClass.replace('width-', ''); // 예: 'width-650' → '650'

      tblCut.forEach(el => {
        el.style.maxWidth = widthValue + 'px';
      });
    }
  }
});


function showLoading(){
  const loadingOverlay = document.getElementById("loadingOverlay");

  loadingOverlay.style.display = "flex";
}

function hideLoading(){
  const loadingOverlay = document.getElementById("loadingOverlay");

  loadingOverlay.style.display = "none";
}
