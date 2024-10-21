

$(function(){
    gradient_background_motion();
})

function gradient_background_motion(){

    const element = document.querySelectorAll('.motion');

    element.forEach( ( background ) => {

        const motion = gsap.timeline({ repeat: -1, paused: true });

        motion.addLabel('step1');
        motion.to(background.querySelector('.motion-item-01'), { x: '73%', y: '47%', duration: 5, ease: 'none' }, 'step1');
        motion.to(background.querySelector('.motion-item-02'), { x: '64%', y: '-63%', duration: 5, ease: 'none' }, 'step1');
        motion.to(background.querySelector('.motion-item-03'), { x: '-137%', y: '16%', duration: 5, ease: 'none' }, 'step1');

        motion.addLabel('step2');
        motion.to(background.querySelector('.motion-item-01'), { x: '137%', y: '-16%', duration: 5, ease: 'none' }, 'step2');
        motion.to(background.querySelector('.motion-item-02'), { x: '-73%', y: '-47%', duration: 5, ease: 'none' }, 'step2');
        motion.to(background.querySelector('.motion-item-03'), { x: '-64%', y: '63%', duration: 5, ease: 'none' }, 'step2');

        motion.addLabel('step3');
        motion.to(background.querySelector('.motion-item-01'), { x: '0%', y: '0%', duration: 5, ease: 'none' }, 'step3');
        motion.to(background.querySelector('.motion-item-02'), { x: '0%', y: '0%', duration: 5, ease: 'none' }, 'step3');
        motion.to(background.querySelector('.motion-item-03'), { x: '0%', y: '0%', duration: 5, ease: 'none' }, 'step3');

        ScrollTrigger.create({
            trigger: background,
            once: false,
            onEnter: function(){
                if(motion.paused() ) {
                    motion.play();
                }
            },
            onEnterBack: function(){
                if(motion.paused() ) {
                    motion.play();
                }
            },
            onLeave: function(){
                if( !motion.paused() ) {
                    motion.pause();
                }
            },
            onLeaveBack: function(){
                if( !motion.paused() ) {
                    motion.pause();
                }
            }
        });

    });

}