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

// select 초기화
function initSelect() {
  $('select').selectric();
}

// 팝업 열기/닫기
function openPopup(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(checkOverflow, 100); // 팝업 열 때도 넘침 검사
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
    setTimeout(checkOverflow, 100);
  }
}


// 더보기 버튼
function toggleComment(button) {
  const container = button.closest('.detail-idea .detail-cont');
  if (!container) return;

  container.classList.toggle('active');
  const isExpanded = container.classList.contains('active');
  button.textContent = isExpanded ? '...접기' : '...더보기';
}

// 텍스트 넘침 검사
function checkOverflow() {
  document.querySelectorAll('.detail-idea .detail-cont').forEach(container => {
    const btn = container.querySelector('.detail-more');
    if (!btn) return;

    const clone = container.cloneNode(true);
    clone.style.visibility = 'hidden';
    clone.style.position = 'absolute';
    clone.style.height = 'auto';
    clone.style.webkitLineClamp = 'unset';
    clone.style.display = 'block';
    clone.style.whiteSpace = 'normal';

    container.appendChild(clone);

    const isOverflowing = clone.offsetHeight > container.offsetHeight;

    if (isOverflowing) {
      btn.style.display = 'inline-block';
      container.classList.add('more');
    } else {
      btn.style.display = 'none';
      container.classList.remove('more');
    }

    container.removeChild(clone);
  });
}

// 초기 실행
window.addEventListener('load', () => {
  initTooltip();
  initSelect();
  initSearchInput();
  checkOverflow();
});

window.addEventListener('resize', checkOverflow);
