
$(document).ready(function () {
	$('.button-collapse').sideNav({
		// closeOnClick: true
	});
	$('select').material_select();
});


function hideFlashMessages() {
	$(this).fadeOut();
}

setTimeout(function () {
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

if (window.location.pathname === "/upload") { //only run for "upload" page
	var allSite = ['PS1 Pyro', 'PS2 Pyro', 'PS3 Pyro', 'PS4 Pyro', 'PS5 Pyro', 'PS11 Pyro', 'PS12 Pyro', 'PS13 Pyro', 'PS14 Pyro', 'PS15 Pyro', 'PS16 Pyro', 'PS1 Inv', 'PS2 Inv', 'PS3 Inv', 'PS4 Inv', 'PS5 Inv', 'PS11 Inv', 'PS12 Inv', 'PS13 Inv', 'PS14 Inv', 'PS15 Inv', 'PS16 Inv'];
	//get a list of files currently stored on server
	$.getJSON('./api/getFiles', function (data) { //calls a fs.readdir api
		var items = [];
		$.each(allSite, function (key, val) {
			var inArray, hrefVal, buttonVal, dataVal;
			dataVal = allSite[key].slice(-4);
			if (dataVal !== 'Pyro') {
				dataVal = 'Inv';
				if (val.length > 7) { // to call api an "id" is needed, here we use different string methods depending on length, ie ps1 pyro or ps11 pyro will be different string lengths 
					hrefVal = val.substring(2, 4);
				} else {
					hrefVal = val.charAt(2);
				}
			} else {
				if (val.length > 8) { // to call api an "id" is needed, here we use different string methods depending on length, ie ps1 pyro or ps11 pyro will be different string lengths 
					hrefVal = val.substring(2, 4);
				} else {
					hrefVal = val.charAt(2);
				}
			}
			if ($.inArray(val + '.csv', data) > -1) { //make a nice tick if item exists on server and add refresh button
				inArray = '<i class="material-icons green-text">done</i>';
				buttonVal = '<input id="clickMe" type="button" value="Refresh" onclick="refreshData(' + hrefVal + ', \'' + dataVal + '\');" />';
			} else {
				inArray = '<i class="material-icons red-text">error</i>'; //make warning if item does not exist on server and no button
				buttonVal = '';
			}
			items.push('<li id=\'' + key + '\'>' + val + ' ' + inArray + ' ' + buttonVal + '</li>');
		});
		$('<ul/>', { // send the items list to the ul
			'id': 'listOfSites',
			html: items.join('')
		}).appendTo('.listOfFiles'); //append it to the html class 
	});
}

function refreshData(id, dataType) { // a function to refresh data on press
	$.getJSON('./api/mySQL/' + dataType + 'Upload/' + id, function (data) {

		console.log(id);

	});
}
