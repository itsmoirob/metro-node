
$(document).ready(function() {
	$(".button-collapse").sideNav();
	$('select').material_select();
});


function hideFlashMessages() {
	$(this).fadeOut();
}

setTimeout(function() {
	$('.success').each(hideFlashMessages);
}, 5000);
$('.success').click(hideFlashMessages);


