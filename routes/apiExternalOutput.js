module.exports = function (app, connection, csvParse, fs, moment, pool, config, http, JSFtp, stringify) {

	var mpanList = [
		{ "id": 1, "mpan": "2100041172109", "exportMpan": "2100041172093", "name": "Garn" },
		{ "id": 2, "mpan": "2000055901355", "exportMpan": "2000055901346", "name": "Newton" },
		{ "id": 3, "mpan": "2000055901300", "exportMpan": "2000055901285", "name": "Race" },
		{ "id": 4, "mpan": "1050000588215", "exportMpan": "1050000588206", "name": "Nova Scotia" },
		{ "id": 5, "mpan": "2200042384200", "exportMpan": "2200042384194", "name": "Canworthy" },
		{ "id": 6, "mpan": null },
		{ "id": 7, "mpan": "2000056147387" },
		{ "id": 8, "mpan": "1900091171276" },
		{ "id": 9, "mpan": "1900091178963" },
		{ "id": 10, "mpan": "1900091183411" },
		{ "id": 11, "mpan": "2200042480656", "exportMpan": "2200042480610", "name": "Wilton" },
		{ "id": 12, "mpan": "2000056366930", "exportMpan": "2000056366860", "name": "Bedborough" },
		{ "id": 13, "mpan": "2000056456265", "exportMpan": "2000056456256", "name": "Merston" },
		{ "id": 14, "mpan": "1170000610807", "exportMpan": "1170000610791", "name": "Ashby" },
		{ "id": 15, "mpan": "1640000523609", "exportMpan": "1640000523593", "name": "Fanny House" },
		{ "id": 16, "mpan": "2000056474812", "exportMpan": "2000056474803", "name": "Eveley" }
	];

	var metOfficeFtp = new JSFtp({
		host: config.metFtp.host,
		// port: 3331, // defaults to 21
		user: config.metFtp.user,
		pass: config.metFtp.pass
	});
	metOfficeFtp.keepAlive();

		// get export generation
	app.get('/api/mysql/metExport/:id', function (req, res) {
		var id = req.params.id;
		var site = mpanList.filter(function (site) { return site.id == id })[0];
		var inserts = ['export_' + id];
		var filePath = (site.id < 10 ? '0' : '') + site.id + ' Site ' + site.name + '.csv';
		connection.query('SELECT  date_format(date, "%d/%m/%Y") AS date, time, generation FROM ?? where date > NOW() - INTERVAL 7 DAY ORDER BY date DESC;', inserts, function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				stringify(rows, { header: true }, function (err, output) {
					fs.writeFile('./files/metCsv/' + filePath, output, function (err) {
						if (err) {
							return console.log(err);
						}
						metOfficeFtp.put('./files/metCsv/' + filePath, filePath, function (err) {
							if (!err)
								console.log("File transferred successfully!");
							try {
								fs.unlinkSync('./files/metCsv/' + filePath);
							} catch (err) {
								console.log('error while deleting ./files/metCsv/' + filePath);
							}
						});
						console.log('The file was saved! ' + filePath);

					})
				});
				res.send('The file was saved! ' + filePath + ' from ' + rows[0].date);
			}
		});
	});

};