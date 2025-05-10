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



	

