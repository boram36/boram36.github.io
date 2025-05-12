/* design.js */

// 툴팁
function initTooltip() {
  const tooltipButtons = document.querySelectorAll('.tooltip-btn');

  tooltipButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const tooltip = this.nextElementSibling;
      const isOpen = tooltip.classList.contains('active');

      // 모든 툴팁 닫기
      document.querySelectorAll('.tooltip-box').forEach(el => el.classList.remove('active'));

      // 다시 클릭했을 때 닫히게 하기
      if (!isOpen) {
        tooltip.classList.add('active');
      }

      e.stopPropagation();
    });
  });

  // 툴팁 외 영역 클릭 시 닫기
  document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-box').forEach(el => el.classList.remove('active'));
  });
}

$(document).ready(function () {
  $('.datepicker-here').datepicker({
      autoclose: true,
			onSelect: function (formattedDate, date, inst) {
        inst.hide();
      }
  });
})


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

// 검색어 입력창
function initSearchInput() {
  const input = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearBtn');

  if (!input || !searchBtn || !clearBtn) return;

  input.addEventListener('input', function () {
    if (input.value.trim() !== '') {
      searchBtn.style.display = 'none';
      clearBtn.style.display = 'flex';
    } else {
      searchBtn.style.display = 'flex';
      clearBtn.style.display = 'none';
    }
  });

  clearBtn.addEventListener('click', function () {
    input.value = '';
    input.focus();
    searchBtn.style.display = 'flex';
    clearBtn.style.display = 'none';
  });

  searchBtn.addEventListener('click', function () {
    alert('검색 기능 실행'); // 실제 검색 기능 추가
  });
}

// 열기/닫기 버튼
function toggleOpen(button) {
  const comBox = button.closest('.comBox-item');
  const hiddenDetails = comBox.querySelectorAll('.detail-hidden');
  const isOpen = button.classList.contains('open');

  hiddenDetails.forEach(el => {
    el.style.display = isOpen ? 'none' : 'flex';
  });

  if (isOpen) {
    button.textContent = '열기';
    button.classList.remove('open');
  } else {
    button.textContent = '닫기';
    button.classList.add('open');
  }
}


// 더보기 버튼 구현
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".detail-cont").forEach(container => {
    const textEl = container.querySelector(".detail-text");
    const btn = container.querySelector(".detail-more");

    if (!textEl || !btn) return;

    const fullText = textEl.textContent.trim();
    const limit = parseInt(container.dataset.limit, 10);

    container.dataset.fulltext = fullText;

    if (fullText.length > limit) {
      textEl.textContent = fullText.slice(0, limit);
      btn.style.display = "inline";
      btn.textContent = "...더보기";
    } else {
      btn.style.display = "none";
    }
  });
});

function toggleComment(btn) {
  const container = btn.closest(".detail-cont");
  const textEl = container.querySelector(".detail-text");
  const fullText = container.dataset.fulltext;
  const limit = parseInt(container.dataset.limit, 10);

  const isExpanded = btn.textContent.includes("접기");

  if (isExpanded) {
    textEl.textContent = fullText.slice(0, limit);
    btn.textContent = "...더보기";
  } else {
    textEl.textContent = fullText;
    btn.textContent = "...접기";
  }
}


function updateHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', updateHeight);
window.addEventListener('load', updateHeight);

// 초기 실행
window.addEventListener('load', () => {
  initTooltip();
  initSearchInput();
});


// 메인 열기/닫기 버튼
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.candidate-box__top').forEach(topEl => {
    const contEl = topEl.querySelector('.profile-cont'); // <ul>
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


$(document).ready(function () {
  // selectric 초기화
  $('.select-wrap select').selectric();
});

