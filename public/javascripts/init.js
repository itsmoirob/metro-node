
$( document ).ready(function() {
  $(".button-collapse").sideNav();
});


function hideFlashMessages() {
  $(this).fadeOut();
}

setTimeout(function() {
  $('.success').each(hideFlashMessages);
}, 5000);
$('.success').click(hideFlashMessages);

$('.datepicker').pickadate({
  selectMonths: true, // Creates a dropdown to control month
  selectYears: 15 // Creates a dropdown of 15 years to control year
});
