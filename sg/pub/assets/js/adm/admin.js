$(function(){
	
	//gnb
	$('.gnb_li.hasChild > .gnb_li_txt > a').on('click', function(){
		
		var $li = $(this).closest('.gnb_li.hasChild');
		var $ul = $(this).closest('.gnb_li_txt').siblings('.gnb_ul');
		
		if($li.hasClass('active')){
			$li.removeClass('active');
			$ul.slideUp();
		}else{
			$li.addClass('active');
			$ul.slideDown();
		}
		
	});
	
	//gnb_all
	$('.gnb_btn').click(function(){
	        
	    if($(this).hasClass('gnb_btn_active')){
	        $(this).removeClass('gnb_btn_active');
	        
	        $('nav.gnb').removeClass('visible');
	        
	    } else {
	        $(this).addClass('gnb_btn_active');
	        
	        $('nav.gnb').addClass('visible');
	    }

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
		
		$(".gnb_wrap").mCustomScrollbar({
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

