
$(document).ready(function () {
  // Initialize the slick slider
$(".gnb-btn").on("click", function () {
  $(".gnb-btn").toggleClass("active");
  $("body").toggleClass("overflow");
  $("header").toggleClass("active");
});


$(".top-btn").on("click", function () {
  $("html, body").animate({ scrollTop: 0 }, 600); // 600ms 동안 스크롤
  return false;
});
});