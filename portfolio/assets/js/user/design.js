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



