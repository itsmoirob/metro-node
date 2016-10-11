module.exports = function (app, connection, csvParse, fs, moment, pool, config, http, JSFtp) {

	var mpanList = [
		{ "id": 1, "mpan": "2100041172109", "solarGis": "SolarGIS_min15_6_Cowbridge_", "importMpan": "2100041172093", "sitePyro": 2, "pyroMinutes": 60000 },
		{ "id": 2, "mpan": "2000055901355", "solarGis": "SolarGIS_min15_4_Poole_", "importMpan": "2000055901346", "sitePyro": 2, "pyroMinutes": 60000 },
		{ "id": 3, "mpan": "2000055901300", "solarGis": "SolarGIS_min15_5_Lytchett_Minster_", "importMpan": "2000055901285", "sitePyro": 2, "pyroMinutes": 60000 },
		{ "id": 4, "mpan": "1050000588215", "solarGis": "SolarGIS_min15_2_West_Caister_", "importMpan": "1050000588206", "sitePyro": 2, "pyroMinutes": 60000 },
		{ "id": 5, "mpan": "2200042384200", "solarGis": "SolarGIS_min15_8_Canworthy_", "importMpan": "2200042384194", "sitePyro": 4, "pyroMinutes": 60000 },
		{ "id": 6, "mpan": null },
		{ "id": 7, "mpan": "2000056147387" },
		{ "id": 8, "mpan": "1900091171276" },
		{ "id": 9, "mpan": "1900091178963" },
		{ "id": 10, "mpan": "1900091183411" },
		{ "id": 11, "mpan": "2200042480656", "solarGis": "SolarGIS_min15_9_Wilton_", "importMpan": "2200042480610", "sitePyro": 3, "pyroMinutes": 60000 },
		{ "id": 12, "mpan": "2000056366930", "solarGis": "SolarGIS_min15_4_Poole_", "importMpan": "2000056366860", "sitePyro": 4, "pyroMinutes": 60000 },
		{ "id": 13, "mpan": "2000056456265", "solarGis": "SolarGIS_min15_10_Merston_", "importMpan": "2000056456256", "sitePyro": 4, "pyroMinutes": 60000 },
		{ "id": 14, "mpan": "1170000610807", "solarGis": "SolarGIS_min15_11_Ashby_", "importMpan": "1170000610791", "sitePyro": 2, "pyroMinutes": 4000 },
		{ "id": 15, "mpan": "1640000523609", "solarGis": "SolarGIS_min15_7_Morecambe_", "importMpan": "1640000523593" },
		{ "id": 16, "mpan": "2000056474812", "solarGis": "SolarGIS_min15_12_Eveley_", "importMpan": "2000056474803", "sitePyro": 6, "pyroMinutes": 60000 }
	];

	// connect ftp
	var starkFtp = new JSFtp({
		host: config.starkFtp.host,
		// port: 3331, // defaults to 21
		user: config.starkFtp.user,
		pass: config.starkFtp.pass
	});
	starkFtp.keepAlive();

	var solarGisFtp = new JSFtp({
		host: config.solarGisFtp.host,
		// port: 3331, // defaults to 21
		user: config.solarGisFtp.user,
		pass: config.solarGisFtp.pass
	});
	solarGisFtp.keepAlive();

	app.get('/api/ftp/:id', function (req, res) {
		var id = req.params.id;
		var fileName;
		var site = mpanList.filter(function (site) { return site.id == id; })[0];
		if (id === 'NonHH') {
			fileName = 'Primrose Solar Limited NonHH.csv';
		} else {
			fileName = 'Primrose Solar Limited.csv';
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
		var site = mpanList.filter(function (site) { return site.id == id; })[0];

		var day = moment().subtract(1, 'days').format('YYYYMMDD');
		var fileName = site.solarGis + day + '.csv';

		solarGisFtp.get('/CLIMDATA/' + fileName, './files/solarGis/' + site.id + '_' + fileName, function (hadErr) {
			if (hadErr) {
				console.error('There was an error retrieving the file.' + hadErr);
				res.send('There was an error retrieving the file.' + hadErr);
			} else {
				console.log('File copied successfully!');
				res.send('File ' + fileName + ' has been downloaded');
			}
		});
	});

	// upload solargis data to database tables export_# and dailySumExport
	app.get('/api/mySQL/solarGisUpload/:id', function (req, res) {

		var id = req.params.id;
		var site = mpanList.filter(function (site) { return site.id == id; })[0];
		var day = moment().subtract(1, 'days').format('YYYYMMDD');
		var mySQLDay = moment(day).format('YYYY-MM-DD');
		var filePath = './files/solarGis/' + site.id + '_' + site.solarGis + day + '.csv';

		try {
			fs.readFile(filePath, {
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
						connection.query('Start transaction; INSERT INTO `dev`.`dailySolarGis` (`date`, `ps' + site.id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + site.id + '` = \'' + solarGisSum + '\'; INSERT INTO `dev`.`dailyEsol` (`date`, `ps' + site.id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + site.id + '` = if(`ps' + site.id + '` > 0.000009, `ps' + site.id + '`, \'' + solarGisSum + '\'); Commit;', function (err, result) {
							if (err) throw err;
							console.log(result);
							res.send('INSERT INTO `dev`.`dailySolarGis` (`date`, `ps' + site.id + '`) VALUES (\'' + mySQLDay + '\', \'' + solarGisSum + '\') on duplicate key update `ps' + site.id + '` = \'' + solarGisSum + '\';');
						});
					}
				});
				try {
					fs.unlinkSync(filePath);
				} catch (err) {
					console.log('fs.unlinkSync(filePath) did not work for ' + filePath);
				}
			});
		} catch (err) {
			console.log('fs.readFile(filePath) ' + filePath);
		}
	});

	// upload export to database tables export_# and dailySumExport
	app.get('/api/mySQL/exportUpload/:id', function (req, res) {

		var id = req.params.id;
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
					var site = readingsForExport.filter(function (site) { return site.id == id; })[0];
					var sqlInputData = [];
					var n = 0;
					for (var j = 0; j < site.data.length; j++) { // use this line only for histroical data
						var day = moment(site.data[j][startIndex - 1], "DD/MM/YYYY").format("YYYY-MM-DD");
						var hour = moment("00:30", "HH:mm").format("HH:mm");
						for (var i = startIndex; i < site.data[j].length; i++) {

							if (site.data[j][i] === "-") {
								site.data[j][i] = "NULL";
							}

							sqlInputData[n] = ["('" + day + "','" + hour + "'," + site.data[j][i] + ")"];
							hour = moment(hour, "HH:mm").add(30, 'minutes').format("HH:mm");
							n++;
						}
					}
					connection.query('INSERT INTO export_' + site.id + ' VALUES ' + sqlInputData + ' ON DUPLICATE KEY UPDATE generation=VALUES(generation); insert into dailySumExport(date,PS' + site.id + ') select date, sum(generation) from export_' + site.id + ' where date > NOW() - INTERVAL 30 DAY group by date order by date asc on duplicate key update PS' + site.id + '=VALUES(PS' + site.id + ');', function (err, result) {
						if (err) {
							console.log('Error auto export upload file ' + site.exportMpan + ' : ' + err);
							res.send('ERROR file ' + site.exportMpan + ' : INSERT INTO export_' + site.id + ' VALUES ' + sqlInputData);
						} else {
							console.log('Site: ' + site.id + '; ExportHHSQL: ' + result[0].message + '; ExportDailySumSQL: ' + result[1].message);
							res.send('COMPLETE: INSERT INTO export_' + site.id + ' VALUES ' + sqlInputData[0] + '  ON DUPLICATE KEY UPDATE generation=VALUES(generation); <br> ExportHHSQL: ' + result[0].message + '; ExportDailySumSQL: ' + result[1].message);
						}
					});

				}
			});
		});
	});

	// upload export to database tables export_# and dailySumExport
	app.get('/api/mySQL/importUpload/:id', function (req, res) {

		var id = req.params.id;
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
							return item[0] === mpan.importMpan;
						});
						return {
							id: mpan.id,
							data: readingsForOneExport
						};
					});
					var site = readingsForExport.filter(function (site) { return site.id == id; })[0];
					var sqlInputData = [];
					var n = 0;
					for (var j = 0; j < site.data.length; j++) { // use this line only for histroical data
						var day = moment(site.data[j][startIndex - 1], "DD/MM/YYYY").format("YYYY-MM-DD");
						var hour = moment("00:30", "HH:mm").format("HH:mm");
						for (var i = startIndex; i < site.data[j].length; i++) {
							if (site.data[j][i] === "-") {
								site.data[j][i] = "NULL";
							}
							sqlInputData[n] = ["('" + day + "','" + hour + "'," + site.data[j][i] + ")"];
							hour = moment(hour, "HH:mm").add(30, 'minutes').format("HH:mm");
							n++;
						}
					}
					connection.query('INSERT INTO import_' + site.id + ' VALUES ' + sqlInputData + '  ON DUPLICATE KEY UPDATE generation=VALUES(generation); insert into dailySumImport(date,PS' + site.id + ') select date, sum(generation) from import_' + site.id + ' where date > NOW() - INTERVAL 100 DAY group by date order by date asc on duplicate key update PS' + site.id + '=VALUES(PS' + site.id + ');', function (err, result) {
						if (err) {
							console.log('Error auto import upload file ' + site.id + ' : ' + err);
							res.send('ERROR file ' + site.id + ' : INSERT INTO import_' + site.id + ' VALUES ' + sqlInputData);
						} else {
							console.log('Site: ' + site.id + '; ImportHHSQL: ' + result[0].message + '; ImportDailySumSQL: ' + result[1].message);
							res.send('COMPLETE: INSERT INTO import_' + site.id + ' VALUES ' + sqlInputData[0] + '  ON DUPLICATE KEY UPDATE generation=VALUES(generation); <br> ImportHHSQL: ' + result[0].message + '; ImportDailySumSQL: ' + result[1].message);
						}
					});
				}
			});
		});
	});

	app.get('/api/mySQL/manualImportUpload/:id', function (req, res) {
		var id = req.params.id;
		var site = mpanList.filter(function (site) { return site.id == id; })[0];
		var filePath = "./files/" + site.importMpan + ".csv";
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

					for (j = 1; j < data.length; j++) { // use this line only for histroical data
						var day = moment(data[j][7], "DD/MM/YYYY").format("YYYY-MM-DD");
						for (i = 8; i < data[j].length; i++) {
							var hour = data[7][i];
							if (data[j][i] === "-") {
								data[j][i] = "NULL";
							}
							sqlInputData[n] = ["('" + day + "','" + hour + "'," + data[j][i] + ")"];
							n++;
						}
					}
					// res.send('Start transaction; INSERT INTO import_' + site.id + ' VALUES ' + sqlInputData + '  ON DUPLICATE KEY UPDATE generation=VALUES(generation); insert into dailySumImport(date,PS' + site.id + ') select date, sum(generation) from import_' + site.id + ' where date > NOW() - INTERVAL 600 DAY group by date order by date asc on duplicate key update PS' + site.id + '=VALUES(PS' + site.id + '); commit;');
					connection.query('Start transaction; INSERT INTO import_' + site.id + ' VALUES ' + sqlInputData + '  ON DUPLICATE KEY UPDATE generation=VALUES(generation); insert into dailySumImport(date,PS' + site.id + ') select date, sum(generation) from import_' + site.id + ' group by date order by date asc on duplicate key update PS' + site.id + '=VALUES(PS' + site.id + '); commit;', function (err, result) {
						if (err) {
							console.log('Error manual import upload file ' + site.importMpan + ' : ' + err);
							res.send('ERROR file ' + site.importMpan + ' : INSERT INTO import_' + site.id + ' VALUES ' + sqlInputData);
						} else {
							console.log(result.insertId);
							res.send('Done: INSERT INTO import_' + site.id + ' VALUES ' + sqlInputData[0]);
						}
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
						var day = moment(data[j][7], "DD/MM/YYYY").format("YYYY-MM-DD");
						for (i = 8; i < data[j].length; i++) {
							var hour = data[7][i];
							if (data[j][i] === "-") {
								data[j][i] = "NULL";
							}
							sqlInputData[n] = ["('" + day + "','" + hour + "'," + data[j][i] + ")"];
							// hour = moment(hour,"DD/MM/YYYY").add(30,'minutes');
							n++;
						}
					}
					connection.query("Start transaction; INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData + "  ON DUPLICATE KEY UPDATE generation=VALUES(generation); insert into dailySumExport(date,PS" + mpanList[id].id + ") select date, sum(generation) from export_" + mpanList[id].id + " group by date order by date asc on duplicate key update PS" + mpanList[id].id + "=VALUES(PS" + mpanList[id].id + "); commit;", function (err, result) {
						if (err) throw err;
						console.log(result.insertId);
						res.send("Done: INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData);
					});
				}
			});
		});
	});


	// upload pyro data. Will grab a csv file from server that was previously uploaded and it will store the contents in to the specific site pyro table, and update the dailyEsol table
	app.get('/api/mySQL/pyroUpload/:id', function (req, res) {
		var id = req.params.id; //get ID from url
		var filePath = "./files/PS" + id + " Pyro.csv"; //locate correct CSV for uploading data
		var site = mpanList.filter(function (site) { return site.id == id; })[0]; //filter the correct site for extra params

		fs.readFile(filePath, {  //start reading file
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
					var sqlInputData = []; //this array will store the data to send to query
					var sqlDupeText = []; //base text array for DUPLCIATE text of query
					var sqlValueText = []; //base text array for storing text for VALUE statement
					var sqlEsolText = []; //base text array for storing text for calculation on dailyEsol table
					var sqlEsolText2 = []; //base text array for storing text for calculation on dailyEsol table

					// loop through each row and get text ready for data to be uploaded to database tables
					for (var j = 1; j < data.length; j++) {
						if (data[j][0] === '') { continue; } // If there are any extra rows that contain no date/data, this will skip them

						var sqlText = ''; //base text variable for individual lines of CSV

						//the below IFs will modify the date format to work with sql format YYYY-MM-DD HH:mm as different CSV files have different date formats
						if (moment(data[j][0], 'DD/MM/YYYY HH:mm', true).isValid()) { 
							data[j][0] = moment(data[j][0], 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
						} else {
							data[j][0] = moment(data[j][0]).format('YYYY-MM-DD HH:mm');
						}

						sqlText = sqlText + '(\'' + data[j][0] + '\''; //add in date that has been set up in correct format

						// loop through each column per row and add in data as different CSVS have different column numbers per row
						for (var k = 1; k < data[0].length; k++) {
							//loop through however many columns there are and get the text prepared for sql queries depending on column numbers.
							if (j === 1) {
								sqlDupeText.push('pyro_' + k + '= VALUES (pyro_' + k + ')');
								if (isNaN(data[0][k])) {
									sqlValueText.push('pyro_' + k);
								} else {
									sqlValueText.push('pyro_' + data[0][k]);
								}
								sqlEsolText.push('ifnull(pyro_' + k + ',0)');
								sqlEsolText2.push('(case when pyro_' + k + ' >= 0 then 1 else 0 end)');
							}
							data[j][k] = parseFloat(data[j][k]);
							if (isNaN(data[j][k])) { //set value to NULL if the data value is not a number
								data[j][k] = 'NULL';
							}
							if (data[j][k] < 0) { //set value to 0 if the data value negative, as there should be no negative values
								data[j][k] = 0;
							}
							sqlText = sqlText + ', ' + data[j][k];
						}
						sqlText = sqlText + ')'; // this just adds a final bracket on the end of the text query
						sqlInputData.push(sqlText); // push the statement to the array of statements
					}
					connection.query('INSERT INTO pyro_site_' + id + ' (`dateTime`, ' + sqlValueText.join(', ') + ') ' + sqlInputData.join(', ') + ' ON DUPLICATE KEY UPDATE ' + sqlDupeText.join(', ') + '; INSERT INTO dailyEsol (date, ps' + id + ') SELECT date(dateTime), SUM((' + sqlEsolText.join(' + ') + ')/(' + sqlEsolText2.join(' + ') + '))/' + site.pyroMinutes + ' FROM pyro_site_' + id + ' WHERE date(dateTime) > NOW() - INTERVAL 14 DAY GROUP BY date(dateTime) ORDER BY dateTime DESC ON DUPLICATE KEY UPDATE PS' + id + ' = VALUES(ps' + id + ');', function (err, result) {
						if (err) throw err;
						console.log(result);
						res.send(data[1][0]);
					});
				}
			});
		});
	});

	// upload inverter data.
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
					var sqlInputData = []; //store the results of query
					var j;
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
							res.status(201).send("Done: INSERT INTO inverter_generation_" + id + "_" + data[0][1].substring(0, 3) + sqlInputData[0]);
						});
					} else { //how to query for all sites that arent using multiple tables
						// collect data and format it in array to use in sqlquery
						for (j = 1; j < data.length; j++) {
							data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
							for (i = 1; i <= data[j].length - 1; i++) {
								data[j][i] = parseFloat(data[j][i]);
								if (isNaN(data[j][i])) {
									data[j][i] = 'NULL';
								}
								if (data[j][i] < 0) {
									data[j][i] = 0;
								}
								sqlInputData.push('("' + data[j][0] + '", ' + data[0][i] + ', ' + data[j][i] + ')');
							}
						}
						// res.send('Start transaction; INSERT INTO inverter_generation_' + id + ' VALUES ' + sqlInputData.join(', ') + ' ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_' + id + ' where generation is null; Commit;');
						connection.query("Start transaction; INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_" + id + " where generation is null; Commit;", function (err, result) { //Run query to upload inverter data to table
							if (err) throw err;
							console.log(result.insertId);
							res.status(201).send("Done: INSERT INTO inverter_generation_" + id + sqlInputData[0]); //output to screen summary
						});
					}
				}
			});
		});
	});


	// https://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request/
	app.get('/api/mySQL/autoPyroUpload/:id', function (req, res) {
		var id = req.params.id;
		if (id == 5) {
			var end = moment().subtract(10080, 'minutes').format('YYYY-MM-DDHH:mm') + ':00';
			var start = moment().subtract(31, 'minutes').format('YYYY-MM-DDHH:mm') + ':00';
			var options = {
				hostname: 'host.webdom.es',
				port: 8090,
				// path: '/WDService/WBService.svc/GetInfoInvertersJSON/1/1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21/POWER_AC/2016-07-0114:45:00/2016-07-0114:49:00',
				path: '/WDService/WBService.svc/GetInfoMeteorologyJSON/1/2;3;5/IRRADIANCE/' + end + '/' + start,
				method: 'GET'
			};
			console.log(options.hostname + ':' + options.port + options.path);
			req = http.request(options, function (res) {
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
					console.log('No more data in response.');
					var parseArr = JSON.parse(data);
					for (i = 1; i <= parseArr.length - 1; i++) {
						var number = (parseArr[i].Value).replace(/\./g, '').replace(/\,/g, '.');
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
					connection.query('Start transaction;' + sqlInputText1 + sqlInputText2 + sqlInputText3 + sqlInputText4 + ' insert into dailyEsol (date, PS5) select date(dateTime), sum((ifnull(pyro_1,0) + ifnull(pyro_2,0) + ifnull(pyro_3,0) + ifnull(pyro_4,0))/((case when pyro_1 >= 0 then 1 else 0 end) + (case when pyro_2 >= 0 then 1 else 0 end) + (case when pyro_3 >= 0 then 1 else 0 end) + (case when pyro_4 >= 0 then 1 else 0 end)))/60000 from pyro_site_5 where date(dateTime) > NOW() - INTERVAL 14 day group by date(dateTime) order by dateTime desc on duplicate key update PS5 = values(PS5); Commit;', function (err, result) {
						if (err) throw err;
						console.log(result);
					});
				});
			});
			req.on('error', function (e) {
				console.log('problem with request: ' + e.message);
			});
			req.end();
			res.status(200).send();
		}
	});


	// https://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request/
	app.get('/api/mySQL/autoInvUpload/:id', function (req, res) {
		var id = req.params.id;
		if (id == 5) {
			var end = moment().subtract(4320, 'minutes').format('YYYY-MM-DDHH:mm') + ':00';
			var start = moment().subtract(31, 'minutes').format('YYYY-MM-DDHH:mm') + ':00';
			// var end = '2016-08-0100:00:00';
			var options = {
				hostname: 'host.webdom.es',
				port: 8090,
				path: '/WDService/WBService.svc/GetInfoInvertersJSON/1/1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21/POWER_AC/' + end + '/' + start,
				// path: '/WDService/WBService.svc/GetInfoMeteorologyJSON/1/2;3;5/IRRADIANCE/' + end + '/' + start,
				method: 'GET'
			};
			console.log(options.hostname + ':' + options.port + options.path);
			req = http.request(options, function (res) {
				var data = '';
				var sqlInputData = [];
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					data += chunk;
				});
				res.on('end', function () {
					console.log('No more data in response.');
					var parseArr = JSON.parse(data);
					for (i = 1; i <= parseArr.length - 1; i++) {
						var number = (parseArr[i].Value).replace(/\./g, '').replace(/\,/g, '.') / 1000;
						sqlInputData.push('("' + parseArr[i].Timestamp + '",' + parseArr[i].InverterID + ',' + number + ')');
					}
					connection.query('INSERT INTO inverter_generation_5 VALUES ' + sqlInputData + ' ON DUPLICATE KEY UPDATE generation = VALUES(generation);', function (err, result) {
						if (err) throw err;
						console.log(result);
					});
				});
			});
			req.on('error', function (e) {
				console.log('problem with request: ' + e.message);
			});
			req.end();
			res.status(200).send();
		}
	});
};
