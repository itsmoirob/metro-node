module.exports = function (app, connection, csvParse, fs, moment, pool, config, http) {
	var JSFtp = require("jsftp");
	//   var request = require('request');


	var mpanList = [
		{ "id": 1, "mpan": "2100041172109", "solarGis": "SolarGIS_min15_6_Cowbridge_" },
		{ "id": 2, "mpan": "2000055901355", "solarGis": "SolarGIS_min15_4_Poole_" },
		{ "id": 3, "mpan": "2000055901300", "solarGis": "SolarGIS_min15_5_Lytchett_Minster_" },
		{ "id": 4, "mpan": "1050000588215", "solarGis": "SolarGIS_min15_2_West_Caister_" },
		{ "id": 5, "mpan": "2200042384200", "solarGis": "SolarGIS_min15_8_Canworthy_" },
		{ "id": 6, "mpan": null },
		{ "id": 7, "mpan": "2000056147387" },
		{ "id": 8, "mpan": "1900091171276" },
		{ "id": 9, "mpan": "1900091178963" },
		{ "id": 10, "mpan": "1900091183411" },
		{ "id": 11, "mpan": "2200042480656", "solarGis": "SolarGIS_min15_9_Wilton_" },
		{ "id": 12, "mpan": "2000056366930", "solarGis": "SolarGIS_min15_4_Poole_" },
		{ "id": 13, "mpan": "2000056456265", "solarGis": "SolarGIS_min15_10_Merston_" },
		{ "id": 14, "mpan": "1170000610807", "solarGis": "SolarGIS_min15_11_Ashby_" },
		{ "id": 15, "mpan": "1640000523609", "solarGis": "SolarGIS_min15_7_Morecambe_" },
		{ "id": 16, "mpan": "2000056474812", "solarGis": "SolarGIS_min15_12_Eveley_" }
	];

	// connect ftp
	var starkFtp = new JSFtp({
		host: config.starkFtp.host,
		// port: 3331, // defaults to 21
		user: config.starkFtp.user,
		pass: config.starkFtp.pass
	});
	starkFtp.keepAlive()

	var solarGisFtp = new JSFtp({
		host: config.solarGisFtp.host,
		// port: 3331, // defaults to 21
		user: config.solarGisFtp.user,
		pass: config.solarGisFtp.pass
	});
	solarGisFtp.keepAlive()

	app.get('/api/ftp/:id', function (req, res) {
		var id = req.params.id;
		if (id === 'NonHH') {
			var fileName = 'Primrose Solar Limited NonHH.csv';
		} else {
			fileName = 'Primrose Solar Limited.csv'
		}
		starkFtp.get(fileName, './files/' + fileName, function (hadErr) {
			if (hadErr) {
				console.error('There was an error retrieving the file.' + hadErr);
				res.send('There was an error retrieving the file.' + hadErr);
			} else {
				console.log('File copied successfully!');
				res.send('File ' + fileName + ' has been downloaded');
			}
		});
	});

	app.get('/api/solarGisFtp/:id', function (req, res) {
		var id = req.params.id;
		id = id - 1;

		var day = moment().subtract(1, 'days').format('YYYYMMDD');
		var fileName = mpanList[id].solarGis + day + '.csv';

		solarGisFtp.get('/CLIMDATA/' + fileName, './files/' + fileName, function (hadErr) {
			if (hadErr) {
				console.error('There was an error retrieving the file.' + hadErr);
				res.send('There was an error retrieving the file.' + hadErr);
			} else {
				console.log('File copied successfully!');
				res.send('File ' + fileName + ' has been downloaded');
			}
		});
	});

	// upload export to database tables export_# and dailySumExport
	app.get('/api/mySQL/exportUpload/:id', function (req, res) {

		var id = req.params.id;
		id = id - 1;
		var filePath = "./files/Primrose Solar Limited.csv";
		var startIndex = 3;

		fs.readFile(filePath, {
			encoding: 'utf-8'
		}, function (err, csvData) {
			if (err) {
				console.log(err);
			}
			csvParse(csvData, {
				separator: ',',
				newline: '\n'
			}, function (err, data) {
				if (err) {
					console.log(err);
				} else {

					var readingsForExport = mpanList.map(function (mpan) {
						var readingsForOneExport = data.filter(function (item) {
							return item[0] === mpan.mpan;
						});
						return {
							id: mpan.id,
							data: readingsForOneExport
						};
					});


					var sqlInputData = [];
					var n = 0;

					for (var j = 0; j < readingsForExport[id].data.length; j++) { // use this line only for histroical data
						var day = moment(readingsForExport[id].data[j][startIndex - 1], "DD/MM/YYYY").format("YYYY-MM-DD");
						var hour = moment("00:00", "HH:mm").format("HH:mm");
						for (var i = startIndex; i < readingsForExport[id].data[j].length; i++) {

							if (readingsForExport[id].data[j][i] === "-") {
								readingsForExport[id].data[j][i] = "NULL";
							}

							sqlInputData[n] = ["(NULL, '" + day + "','" + hour + "'," + readingsForExport[id].data[j][i] + ")"];
							hour = moment(hour, "HH:mm").add(30, 'minutes').format("HH:mm");
							n++;
						}
					}

					connection.query("Start transaction; INSERT INTO export_" + readingsForExport[id].id + " VALUES " + sqlInputData + "  ON DUPLICATE KEY UPDATE generation=VALUES(generation); insert into dailySumExport(date,PS" + readingsForExport[id].id + ") select date, sum(generation) from export_" + readingsForExport[id].id + " where date > NOW() - INTERVAL 30 DAY group by date order by date asc on duplicate key update PS" + readingsForExport[id].id + "=VALUES(PS" + readingsForExport[id].id + "); commit;", function (err, result) {
						if (err) throw err;
						console.log(result);
						res.send("COMPLETE: INSERT INTO export_" + readingsForExport[id].id + " VALUES " + sqlInputData[0] + "  ON DUPLICATE KEY UPDATE generation=VALUES(generation);" + result.message);
					});

				}
			});
		});
	});

	// upload solargis data to database tables export_# and dailySumExport
	app.get('/api/mySQL/solarGisUpload/:id', function (req, res) {

		var id = req.params.id;
		id = id - 1;
		var day = moment().subtract(1, 'days').format('YYYYMMDD');
		var mySQLDay = moment(day).format('YYYY-MM-DD');
		var fileName = './files/' + mpanList[id].solarGis + day + '.csv';

		fs.readFile(fileName, {
			encoding: 'utf-8'
		}, function (err, csvData) {
			if (err) {
				console.log(err);
			}
			csvParse(csvData, { comment: '#', delimiter: ';' }, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					var solarGisSum = 0;
					for (var j = 1; j < data.length; j++) {

						solarGisSum = solarGisSum + parseInt(data[j][4]);
					}
					solarGisSum = solarGisSum / 4000;

					// res.send('Start transaction; INSERT INTO `dev`.`dailySolarGis` (`date`, `ps' + mpanList[id].id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + mpanList[id].id + '` = \'' + solarGisSum + '\'; INSERT INTO `dev`.`dailyEsol` (`date`, `ps' + mpanList[id].id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + mpanList[id].id + '` = if(`ps' + mpanList[id].id + '` > 0.000009, `ps' + mpanList[id].id + '`, \'' + solarGisSum + '\'); Commit;');
					connection.query('Start transaction; INSERT INTO `dev`.`dailySolarGis` (`date`, `ps' + mpanList[id].id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + mpanList[id].id + '` = \'' + solarGisSum + '\'; INSERT INTO `dev`.`dailyEsol` (`date`, `ps' + mpanList[id].id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + mpanList[id].id + '` = if(`ps' + mpanList[id].id + '` > 0.000009, `ps' + mpanList[id].id + '`, \'' + solarGisSum + '\'); Commit;', function (err, result) {
						if (err) throw err;
						console.log(result);
						res.send('INSERT INTO `dev`.`dailySolarGis` (`date`, `ps' + mpanList[id].id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + mpanList[id].id + '` = \'' + solarGisSum + '\';');
					});
				}
			});
		});
	});

	app.get('/api/mySQL/manualExportUpload/:id', function (req, res) {
		var id = req.params.id - 1;
		var filePath = "./files/" + mpanList[id].mpan + ".csv";
		fs.readFile(filePath, {
			encoding: 'utf-8'
		}, function (err, csvData) {
			if (err) {
				console.log(err);
			}
			csvParse(csvData, {
				separator: ',',
				newline: '\n'
			}, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					var sqlInputData = [];
					var n = 0;

					for (j = 8; j < data.length; j++) { // use this line only for histroical data
						var day = moment(data[j][7], "DD/MM/YY").format("YYYY-MM-DD");
						for (i = 8; i < data[j].length; i++) {
							var hour = data[7][i];
							if (data[j][i] === "-") {
								data[j][i] = "NULL";
							}
							sqlInputData[n] = ["(NULL, '" + day + "','" + hour + "'," + data[j][i] + ")"];
							// hour = moment(hour,"DD/MM/YYYY").add(30,'minutes');
							n++;
						}
					}
					// res.send("INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData + "  ON DUPLICATE KEY UPDATE generation=VALUES(generation)");
					connection.query("Start transaction; INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData + "  ON DUPLICATE KEY UPDATE generation=VALUES(generation); insert into dailySumExport(date,PS" + mpanList[id].id + ") select date, sum(generation) from export_" + mpanList[id].id + " where date > NOW() - INTERVAL 90 DAY group by date order by date asc on duplicate key update PS" + mpanList[id].id + "=VALUES(PS" + mpanList[id].id + "); commit;", function (err, result) {
						if (err) throw err;
						console.log(result.insertId);
						res.send("Done: INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData);
					});
				}
			});
		});
	});


	// upload pyro data.
	app.get('/api/mySQL/pyroUpload/:id', function (req, res) {
		var id = req.params.id;
		var filePath = "./files/PS" + id + " Pyro.csv";

		fs.readFile(filePath, {
			encoding: 'utf-8'
		}, function (err, csvData) {
			if (err) {
				console.log(err);
			}
			csvParse(csvData, {
				separator: ',',
				newline: '\n'
			}, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					var sqlInputData = [];
					var n = 0;
					if (id < 5) {
						for (j = 1; j < data.length; j++) { // if site is 1 to 4
							// data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm"); // if required uncomment out this line
							data[j][1] = parseFloat(data[j][1]);
							data[j][2] = parseFloat(data[j][2]);
							if (isNaN(data[j][1])) {
								data[j][1] = "NULL";
							}
							if (data[j][1] < 0) {
								data[j][1] = 0;
							}
							if (isNaN(data[j][2])) {
								data[j][2] = "NULL";
							}
							if (data[j][2] < 0) {
								data[j][2] = 0;
							}
							sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + ")"];
							n++;
						}

						// res.send("Done: INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData);

						connection.query("Start transaction; INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2); insert into dailyEsol (date, PS" + id + ") select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end)))/60000 from pyro_site_" + id + " where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS" + id + " = values(PS" + id + "); Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData[1]);
						});

					} else if (id == 5) {
						for (j = 1; j < data.length - 1; j++) {
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
							data[j][1] = parseFloat(data[j][1]);

							if (isNaN(data[j][1])) {
								data[j][1] = "NULL";
							}
							if (data[j][1] < 0) {
								data[j][1] = 0;
							}

							sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + ")"];
							n++;
						}
						connection.query('Start transaction; INSERT INTO pyro_site_' + id + ' (dateTime, pyro_' + data[0][1] + ') VALUES ' + sqlInputData + ' ON DUPLICATE KEY UPDATE pyro_' + data[0][1] + '= VALUES(pyro_' + data[0][1] + '); insert into dailyEsol (date, PS' + id + ') select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0) + ifnull(pyro_3,0) + ifnull(pyro_4,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end) + (case when pyro_3 >= 0 then 1 else 0 end) + (case when pyro_4 >= 0 then 1 else 0 end)))/60000 from pyro_site_' + id + ' where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS' + id + ' = values(PS' + id + '); Commit;', function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send('Done: INSERT INTO pyro_site_' + id + ' (dateTime, pyro_' + data[0][1] + ') VALUES ' + sqlInputData[0]);
						});

					} else if (id == 7) {

						for (j = 1; j < data.length; j++) {
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");

							data[j][1] = parseFloat(data[j][1]);
							data[j][2] = parseFloat(data[j][2]);
							data[j][3] = parseFloat(data[j][3]);
							data[j][4] = parseFloat(data[j][4]);
							data[j][5] = parseFloat(data[j][5]);
							data[j][6] = parseFloat(data[j][6]);
							data[j][7] = parseFloat(data[j][7]);
							data[j][8] = parseFloat(data[j][8]);
							data[j][9] = parseFloat(data[j][9]);
							data[j][10] = parseFloat(data[j][10]);
							data[j][11] = parseFloat(data[j][11]);
							data[j][12] = parseFloat(data[j][12]);

							if (isNaN(data[j][1])) {
								data[j][1] = "NULL";
							}
							if (isNaN(data[j][2])) {
								data[j][2] = "NULL";
							}
							if (isNaN(data[j][3])) {
								data[j][3] = "NULL";
							}
							if (isNaN(data[j][4])) {
								data[j][4] = "NULL";
							}
							if (isNaN(data[j][5])) {
								data[j][5] = "NULL";
							}
							if (isNaN(data[j][6])) {
								data[j][6] = "NULL";
							}
							if (isNaN(data[j][7])) {
								data[j][7] = "NULL";
							}
							if (isNaN(data[j][8])) {
								data[j][8] = "NULL";
							}
							if (isNaN(data[j][9])) {
								data[j][9] = "NULL";
							}
							if (isNaN(data[j][10])) {
								data[j][10] = "NULL";
							}
							if (isNaN(data[j][11])) {
								data[j][11] = "NULL";
							}
							if (isNaN(data[j][12])) {
								data[j][12] = "NULL";
							}

							sqlInputData.push("('" + data[j][0] + "'");
							sqlInputData.push(data[j][1]);
							sqlInputData.push(data[j][2]);
							sqlInputData.push(data[j][3]);
							sqlInputData.push(data[j][4]);
							sqlInputData.push(data[j][5]);
							sqlInputData.push(data[j][6]);
							sqlInputData.push(data[j][7]);
							sqlInputData.push(data[j][8]);
							sqlInputData.push(data[j][9]);
							sqlInputData.push(data[j][10]);
							sqlInputData.push(data[j][11]);
							sqlInputData.push(data[j][12] + ")");
							n++;
						}

						connection.query("Start transaction; INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3), pyro_4=VALUES(pyro_4), pyro_5=VALUES(pyro_5), pyro_6=VALUES(pyro_6), pyro_7=VALUES(pyro_7), pyro_8=VALUES(pyro_8), pyro_9=VALUES(pyro_9), pyro_10=VALUES(pyro_10), pyro_11=VALUES(pyro_11), pyro_11=VALUES(pyro_11), pyro_12=VALUES(pyro_12); insert into dailyEsol (date, PS" + id + ") select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0) + ifnull(pyro_3,0) + ifnull(pyro_4,0) + ifnull(pyro_5,0) + ifnull(pyro_6,0) + ifnull(pyro_7,0) + ifnull(pyro_8,0) + ifnull(pyro_9,0) + ifnull(pyro_10,0) + ifnull(pyro_11,0) + ifnull(pyro_12,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end) + (case when pyro_3 >= 0 then 1 else 0 end) + (case when pyro_4 >= 0 then 1 else 0 end) + (case when pyro_5 >= 0 then 1 else 0 end) + (case when pyro_6 >= 0 then 1 else 0 end) + (case when pyro_7 >= 0 then 1 else 0 end) + (case when pyro_8 >= 0 then 1 else 0 end) + (case when pyro_9 >= 0 then 1 else 0 end) + (case when pyro_10 >= 0 then 1 else 0 end) + (case when pyro_11 >= 0 then 1 else 0 end) +(case when pyro_12 >= 0 then 1 else 0 end)))/60000 from pyro_site_" + id + " where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS" + id + " = values(PS" + id + "); Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO pyro_site" + id + " VALUES " + sqlInputData);
						});

					} else if (id > 7 && id < 11) {

						for (var j = 2; j < data.length; j++) { // if site is 7 to 11
							data[j][0] = moment(data[j][0], "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm"); // if required uncomment out this line
							data[j][1] = parseFloat(data[j][1]);
							data[j][2] = parseFloat(data[j][2]);
							if (isNaN(data[j][1])) {
								data[j][1] = "NULL";
							}
							if (data[j][1] < 0) {
								data[j][1] = 0;
							}
							if (isNaN(data[j][2])) {
								data[j][2] = "NULL";
							}
							if (data[j][2] < 0) {
								data[j][2] = 0;
							}
							sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + ")"];
							n++;
						}
						connection.query("Start transaction; INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2); insert into dailyEsol (date, PS" + id + ") select date(dateTime),(ifnull(sum(nullif(pyro_1,0)),0) + ifnull(sum(nullif(pyro_2,0)),0)) / ((case when avg(ifnull(pyro_1,0)) = 0 then 0 else 1 end) + (case when avg(ifnull(pyro_2,0)) = 0 then 0 else 1 end)) / 12000 from pyro_site_" + id + " where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS" + id + " = VALUES(PS" + id + "); Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO pyro_site VALUES " + sqlInputData);
						});

					} else if (id == 11) {

						for (j = 2; j < data.length; j++) { // if site is 11
							data[j][0] = moment(data[j][0], "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm"); // if required uncomment out this line
							data[j][1] = parseFloat(data[j][1]);
							data[j][2] = parseFloat(data[j][2]);
							data[j][3] = parseFloat(data[j][3]);
							if (isNaN(data[j][1])) {
								data[j][1] = "NULL";
							}
							if (data[j][1] < 0.01) {
								data[j][1] = 0;
							}
							if (isNaN(data[j][2])) {
								data[j][2] = "NULL";
							}
							if (data[j][2] < 0.01) {
								data[j][2] = 0;
							}
							if (isNaN(data[j][3])) {
								data[j][3] = "NULL";
							}
							if (data[j][3] < 0.01) {
								data[j][3] = 0;
							}
							sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + "," + data[j][3] + ")"];
							n++;
						}

						connection.query("Start transaction; INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3); insert into dailyEsol (date, PS" + id + ") select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0) + ifnull(pyro_3,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end) + (case when pyro_3 >= 0 then 1 else 0 end)))/60000 from pyro_site_" + id + " where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS" + id + " = values(PS" + id + "); Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData[0]);
						}
						);

					} else if (id >= 12 && id <= 13) {
						for (j = 1; j < data.length; j++) {

							data[j][0] = moment(data[j][0], 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
							data[j][1] = parseFloat(data[j][1]);
							data[j][2] = parseFloat(data[j][2]);
							data[j][3] = parseFloat(data[j][3]);
							data[j][4] = parseFloat(data[j][4]);
							if (isNaN(data[j][1])) {
								data[j][1] = 'NULL';
							}
							if (data[j][1] < 0) {
								data[j][1] = 0;
							}
							if (isNaN(data[j][2])) {
								data[j][2] = 'NULL';
							}
							if (data[j][2] < 0) {
								data[j][2] = 0;
							}
							if (isNaN(data[j][3])) {
								data[j][3] = 'NULL';
							}
							if (data[j][3] < 0) {
								data[j][3] = 0;
							}
							if (isNaN(data[j][4])) {
								data[j][4] = 'NULL';
							}
							if (data[j][4] < 0) {
								data[j][4] = 0;
							}
							sqlInputData[n] = ['(\'' + data[j][0] + '\',' + data[j][1] + ',' + data[j][2] + ',' + data[j][3] + ',' + data[j][4] + ')'];
							n++;
						}

						connection.query('Start transaction;INSERT INTO pyro_site_' + id + ' VALUES ' + sqlInputData + ' ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3), pyro_4=VALUES(pyro_4); insert into dailyEsol (date, PS' + id + ') select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0) + ifnull(pyro_3,0) + ifnull(pyro_4,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end) + (case when pyro_3 >= 0 then 1 else 0 end) + (case when pyro_4 >= 0 then 1 else 0 end)))/60000 from pyro_site_' + id + ' where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS' + id + ' = values(PS' + id + '); Commit;', function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send('Done: INSERT INTO pyro_site_' + id + ' VALUES ' + sqlInputData[0]);
						});

					} else if (id == 14) {
						for (j = 1; j < data.length; j++) { // if site is 1 to 4
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm"); // if required uncomment out this line
							data[j][1] = parseFloat(data[j][1]);
							data[j][2] = parseFloat(data[j][2]);
							if (isNaN(data[j][1])) {
								data[j][1] = "NULL";
							}
							if (data[j][1] < 0) {
								data[j][1] = 0;
							}
							if (isNaN(data[j][2])) {
								data[j][2] = "NULL";
							}
							if (data[j][2] < 0) {
								data[j][2] = 0;
							}
							sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + ")"];
							n++;
						}

						//  res.send("Done: INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData);

						connection.query("Start transaction; INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2); insert into dailyEsol (date, PS" + id + ") select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end)))/4000 from pyro_site_" + id + " where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS" + id + " = values(PS" + id + "); Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData[1]);
						});

					} else if (id == 16) {
						for (j = 1; j < data.length; j++) {

							data[j][0] = moment(data[j][0], 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
							data[j][1] = parseFloat(data[j][1]);
							data[j][2] = parseFloat(data[j][2]);
							data[j][3] = parseFloat(data[j][3]);
							data[j][4] = parseFloat(data[j][4]);
							data[j][5] = parseFloat(data[j][5]);
							data[j][6] = parseFloat(data[j][6]);
							if (isNaN(data[j][1])) {
								data[j][1] = 'NULL';
							}
							if (data[j][1] < 0) {
								data[j][1] = 0;
							}
							if (isNaN(data[j][2])) {
								data[j][2] = 'NULL';
							}
							if (data[j][2] < 0) {
								data[j][2] = 0;
							}
							if (isNaN(data[j][3])) {
								data[j][3] = 'NULL';
							}
							if (data[j][3] < 0) {
								data[j][3] = 0;
							}
							if (isNaN(data[j][4])) {
								data[j][4] = 'NULL';
							}
							if (data[j][4] < 0) {
								data[j][4] = 0;
							}
							if (isNaN(data[j][5])) {
								data[j][5] = 'NULL';
							}
							if (data[j][5] < 0) {
								data[j][5] = 0;
							}
							if (isNaN(data[j][6])) {
								data[j][6] = 'NULL';
							}
							if (data[j][6] < 0) {
								data[j][6] = 0;
							}
							sqlInputData[n] = ['(\'' + data[j][0] + '\',' + data[j][1] + ',' + data[j][2] + ',' + data[j][3] + ',' + data[j][4] + ',' + data[j][5] + ',' + data[j][6] + ')'];
							n++;
						}
						connection.query('Start transaction;INSERT INTO pyro_site_' + id + ' VALUES ' + sqlInputData + ' ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3), pyro_4=VALUES(pyro_4), pyro_5=VALUES(pyro_5), pyro_6=VALUES(pyro_6); insert into dailyEsol (date, PS' + id + ') select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0) + ifnull(pyro_3,0) + ifnull(pyro_4,0) + ifnull(pyro_5,0) + ifnull(pyro_6,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end) + (case when pyro_3 >= 0 then 1 else 0 end) + (case when pyro_4 >= 0 then 1 else 0 end) + (case when pyro_5 >= 0 then 1 else 0 end) + (case when pyro_6 >= 0 then 1 else 0 end)))/60000 from pyro_site_' + id + ' where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS' + id + ' = values(PS' + id + '); Commit;', function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send('Done: INSERT INTO pyro_site_' + id + ' VALUES ' + sqlInputData[0]);
						});
					}
				};
			});
		})
	});

	// upload pyro data.
	app.get('/api/mySQL/invUpload/:id', function (req, res) {
		var id = req.params.id;
		var filePath = "./files/PS" + id + " Inv.csv";

		fs.readFile(filePath, {
			encoding: 'utf-8'
		}, function (err, csvData) {
			if (err) {
				console.log(err);
			}
			csvParse(csvData, {
				separator: ',',
				newline: '\n'
			}, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					var sqlInputData = [];
					if (id <= 4) {
						for (j = 1; j < data.length; j++) {
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
							sqlInputData.push("('" + data[j][0] + "'");
							for (i = 1; i <= data[j].length - 1; i++) {
								data[j][i] = parseFloat(data[j][i]);
								if (isNaN(data[j][i])) {
									data[j][i] = "NULL";
								}
								if (i == data[j].length - 1) {
									sqlInputData.push(data[0][i].substring(7, 9) + "," + data[0][i].substring(13, 15) + "," + data[j][i] + ")");
								} else {
									sqlInputData.push(data[0][i].substring(7, 9) + "," + data[0][i].substring(13, 15) + "," + data[j][i] + "),('" + data[j][0] + "'");
								}
							}
						}
						connection.query("Start transaction; INSERT INTO inverter_generation_" + id + "_" + data[0][1].substring(0, 3) + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_" + id + "_" + data[0][1].substring(0, 3) + " where generation is null; Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO inverter_generation_" + id + "_" + data[0][1].substring(0, 3) + sqlInputData[0]);
						});
					} else {
						for (j = 1; j < data.length; j++) {
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
							sqlInputData.push("('" + data[j][0] + "'");
							for (i = 1; i <= data[j].length - 1; i++) {
								data[j][i] = parseFloat(data[j][i]);
								if (isNaN(data[j][i])) {
									data[j][i] = "NULL";
								}
								if (i == data[j].length - 1) {
									sqlInputData.push(i + "," + data[j][i] + ")");
								} else {
									sqlInputData.push(i + "," + data[j][i] + "),('" + data[j][0] + "'");
								}
							}
						}
						// res.send("Start transaction; INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_" + id + " where generation is null; Commit;");
						connection.query("Start transaction; INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_" + id + " where generation is null; Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO inverter_generation_" + id + sqlInputData[0]);
						});
					}
				}
			});
		});
	});



	app.get('/api/mySQL/invUpload/:id', function (req, res) {
		var id = req.params.id;
		var filePath = "./files/PS" + id + " Inv.csv";

		fs.readFile(filePath, {
			encoding: 'utf-8'
		}, function (err, csvData) {
			if (err) {
				console.log(err);
			}
			csvParse(csvData, {
				separator: ',',
				newline: '\n'
			}, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					var sqlInputData = [];
					if (id <= 4) {
						for (j = 1; j < data.length; j++) {
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
							sqlInputData.push("('" + data[j][0] + "'");
							for (i = 1; i <= data[j].length - 1; i++) {
								data[j][i] = parseFloat(data[j][i]);
								if (isNaN(data[j][i])) {
									data[j][i] = "NULL";
								}
								if (i == data[j].length - 1) {
									sqlInputData.push(data[0][i].substring(7, 9) + "," + data[0][i].substring(13, 15) + "," + data[j][i] + ")");
								} else {
									sqlInputData.push(data[0][i].substring(7, 9) + "," + data[0][i].substring(13, 15) + "," + data[j][i] + "),('" + data[j][0] + "'");
								}
							}
						}
						connection.query("Start transaction; INSERT INTO inverter_generation_" + id + "_" + data[0][1].substring(0, 3) + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_" + id + "_" + data[0][1].substring(0, 3) + " where generation is null; Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO inverter_generation_" + id + "_" + data[0][1].substring(0, 3) + sqlInputData[0]);
						});
					} else {
						for (j = 1; j < data.length; j++) {
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
							sqlInputData.push("('" + data[j][0] + "'");
							for (i = 1; i <= data[j].length - 1; i++) {
								data[j][i] = parseFloat(data[j][i]);
								if (isNaN(data[j][i])) {
									data[j][i] = "NULL";
								}
								if (i == data[j].length - 1) {
									sqlInputData.push(i + "," + data[j][i] + ")");
								} else {
									sqlInputData.push(i + "," + data[j][i] + "),('" + data[j][0] + "'");
								}
							}
						}
						// res.send("Start transaction; INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_" + id + " where generation is null; Commit;");
						connection.query("Start transaction; INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_" + id + " where generation is null; Commit;", function (err, result) {
							if (err) throw err;
							console.log(result.insertId);
							res.send("Done: INSERT INTO inverter_generation_" + id + sqlInputData[0]);
						});
					}
				}
			});
		});
	});



	// https://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request/
	app.get('/api/mySQL/autopyroUpload/:id', function (req, res) {

		var id = req.params.id;

		if (id == 5) {

			var end = moment().subtract(211, 'minutes').format('YYYY-MM-DDHH:mm') + ':00';
			var start = moment().subtract(31, 'minutes').format('YYYY-MM-DDHH:mm') + ':00';

			var options = {
				hostname: 'host.webdom.es',
				port: 8090,
				// path: '/WDService/WBService.svc/GetInfoInvertersJSON/1/1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21/POWER_AC/2016-07-0114:45:00/2016-07-0114:49:00',
				path: '/WDService/WBService.svc/GetInfoMeteorologyJSON/1/2;3;5/IRRADIANCE/' + start + '/' + end,
				method: 'GET'
			};
			console.log(options.hostname + ':' + options.port + options.path);

			var req = http.request(options, function (res) {
				var data = '';
				var sqlInputData1 = [];
				var sqlInputData2 = [];
				var sqlInputData3 = [];
				var sqlInputData4 = [];
				var sqlInputText1 = '';
				var sqlInputText2 = '';
				var sqlInputText3 = '';
				var sqlInputText4 = '';
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					data += chunk;
				});

				res.on('end', function () {
					console.log('No more data in response.')
					var parseArr = JSON.parse(data);

					for (i = 1; i <= parseArr.length - 1; i++) {
						var number = (parseArr[i].Value).replace('.', '').replace(',', '.');
						if (parseArr[i].PyraID == '2') {
							sqlInputData1.push('("' + parseArr[i].Timestamp + '",' + number + ')');
						} else if (parseArr[i].PyraID == '3') {
							sqlInputData2.push('("' + parseArr[i].Timestamp + '",' + number + ')');
						} else if (parseArr[i].PyraID == '5') {
							sqlInputData3.push('("' + parseArr[i].Timestamp + '",' + number + ')');
						} else if (parseArr[i].PyraID == '6') {
							sqlInputData4.push('("' + parseArr[i].Timestamp + '",' + number + ')');
						}
					}

					if (sqlInputData1[0]) {
						sqlInputText1 = 'Insert into pyro_site_5(dateTime, pyro_1) values ' + sqlInputData1 + ' ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1);';
					}
					if (sqlInputData2[0]) {
						sqlInputText2 = 'Insert into pyro_site_5(dateTime, pyro_2) values ' + sqlInputData2 + ' ON DUPLICATE KEY UPDATE pyro_2=VALUES(pyro_2);';
					}
					if (sqlInputData3[0]) {
						sqlInputText3 = 'Insert into pyro_site_5(dateTime, pyro_3) values ' + sqlInputData3 + ' ON DUPLICATE KEY UPDATE pyro_3=VALUES(pyro_3);';
					}
					if (sqlInputData4[0]) {
						sqlInputText2 = 'Insert into pyro_site_5(dateTime, pyro_4) values ' + sqlInputData4 + ' ON DUPLICATE KEY UPDATE pyro_4=VALUES(pyro_4);';
					}

					// console.log('Start transaction;' + sqlInputText1 + sqlInputText2 + sqlInputText3 + sqlInputText4 + 'Commit;')

					connection.query('Start transaction;' + sqlInputText1 + sqlInputText2 + sqlInputText3 + sqlInputText4 + ' insert into dailyEsol (date, PS5) select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0) + ifnull(pyro_3,0) + ifnull(pyro_4,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end) + (case when pyro_3 >= 0 then 1 else 0 end) + (case when pyro_4 >= 0 then 1 else 0 end)))/60000 from pyro_site_5 where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS5 = values(PS5); Commit;', function (err, result) {
						if (err) throw err;
						console.log(result);
					});
				})
			});

			req.on('error', function (e) {
				console.log('problem with request: ' + e.message);
			});

			req.end();
		}
	});


};
