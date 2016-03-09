
$(document).ready(function() {
	$(".button-collapse").sideNav({
		// closeOnClick: true
	});
	$('select').material_select();
});


function hideFlashMessages() {
	$(this).fadeOut();
}

setTimeout(function() {
	$('.success').each(hideFlashMessages);
}, 5000);
$('.success').click(hideFlashMessages);

 $('.dropdown-button').dropdown({
		inDuration: 300,
		outDuration: 225,
		constrain_width: false, // Does not change width of dropdown to that of the activator
		hover: true, // Activate on hover
		gutter: 0, // Spacing from edge
		belowOrigin: false, // Displays dropdown below the button
		alignment: 'left' // Displays dropdown with edge aligned to the left of button
	}
);