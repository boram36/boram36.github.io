/**
 * design.js
 * 2024.11.20
 * kimboram
 */


$(function () {
  backgroundMotion();
  effectTxt();
  scrollTop();
});

/**  
 * 메인 텍스트 효과
 * 
 */
function effectTxt() {
  const h1 = document.querySelector('.main-section00__tit').textContent;
  const text = h1.split('');
  let texts = '';

  text.forEach((v) => {
    texts += `<span>${v}</span>`;
    document.querySelector('.main-section00__tit').innerHTML = texts;
  });

  const tl = gsap.timeline({
    defaults: { ease: 'power4.inOut' },
    repeat: -1,
    yoyo: true,
  });

  tl.from(document.querySelectorAll('.main-section00__tit span'), {
    y: 20,
    opacity: 0,
    skewX: 30,
    stagger: 0.03,
    duration: 1,
  }).to(document.querySelectorAll('.main-section00__tit span'), {
    y: -20,
    skewX: 0,
    opacity: 1,
    stagger: 0.03,
    duration: 1,
  });
}

/**  
 * 메인 배경 효과
 * 
 */
function backgroundMotion() {
  const element = document.querySelectorAll('.motion');

  element.forEach((background) => {
    const motion = gsap.timeline({ repeat: -1, paused: true });

    motion.addLabel('step1');
    motion.to(
      background.querySelector('.motion-item-01'),
      { x: '73%', y: '47%', duration: 5, ease: 'none' },
      'step1'
    );
    motion.to(
      background.querySelector('.motion-item-02'),
      { x: '64%', y: '-63%', duration: 5, ease: 'none' },
      'step1'
    );
    motion.to(
      background.querySelector('.motion-item-03'),
      { x: '-137%', y: '16%', duration: 5, ease: 'none' },
      'step1'
    );

    motion.addLabel('step2');
    motion.to(
      background.querySelector('.motion-item-01'),
      { x: '137%', y: '-16%', duration: 5, ease: 'none' },
      'step2'
    );
    motion.to(
      background.querySelector('.motion-item-02'),
      { x: '-73%', y: '-47%', duration: 5, ease: 'none' },
      'step2'
    );
    motion.to(
      background.querySelector('.motion-item-03'),
      { x: '-64%', y: '63%', duration: 5, ease: 'none' },
      'step2'
    );

    motion.addLabel('step3');
    motion.to(
      background.querySelector('.motion-item-01'),
      { x: '0%', y: '0%', duration: 5, ease: 'none' },
      'step3'
    );
    motion.to(
      background.querySelector('.motion-item-02'),
      { x: '0%', y: '0%', duration: 5, ease: 'none' },
      'step3'
    );
    motion.to(
      background.querySelector('.motion-item-03'),
      { x: '0%', y: '0%', duration: 5, ease: 'none' },
      'step3'
    );

    ScrollTrigger.create({
      trigger: background,
      once: false,
      onEnter: function () {
        if (motion.paused()) {
          motion.play();
        }
      },
      onEnterBack: function () {
        if (motion.paused()) {
          motion.play();
        }
      },
      onLeave: function () {
        if (!motion.paused()) {
          motion.pause();
        }
      },
      onLeaveBack: function () {
        if (!motion.paused()) {
          motion.pause();
        }
      },
    });
  });
}

/**  
 * 메인 스크롤 효과
 * 
 */
function scrollTop(){
  let scrollY;
	let btnTop = document.querySelector('.btn-top');


	window.addEventListener('scroll', () => {

		if(window.scrollY > 500){
			btnTop.classList.add('active');
		}else{
			btnTop.classList.remove('active');
		}

	});

  btnTop.addEventListener('click', function(){
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 스크롤 애니메이션 추가
    });
  })

}

/**  
 * 메인 스크롤
 * 
 */

(function () {
  var sec1_3 = document.querySelectorAll('.main-section00');
  var list_txt = document.querySelectorAll('.work-list li');

  // 디버깅용 콘솔 출력
  console.log('sec1_3:', sec1_3); // .cont가 잘 선택되었는지 확인
  console.log('list_txt:', list_txt); // .work-list li가 잘 선택되었는지 확인

  function init() {
      if (sec1_3 && list_txt.length > 0) {
          setPosition();
      } else {
          console.error('필요한 요소가 없습니다. HTML 구조를 확인하세요.');
      }
  }

  function setPosition() {
      if (!sec1_3 || list_txt.length === 0) return; // 요소가 없을 경우 실행 방지

      var percent = sec1_3.getBoundingClientRect().top - 100;

      if (percent < 0) {
          list_txt[0].style.opacity = 1;
          list_txt[1].style.opacity = 1;
          list_txt[0].style.transform = 'translateY(0)';
          list_txt[1].style.transform = 'translateY(0)';
      } else {
          list_txt[0].style.opacity = 0;
          list_txt[1].style.opacity = 0;
          list_txt[0].style.transform = 'translateY(25%)';
          list_txt[1].style.transform = 'translateY(25%)';
      }
  }

  window.addEventListener('scroll', function () {
      setPosition();
  }, false);

  window.addEventListener('resize', function () {
      setPosition();
  }, false);

  init();
})();

