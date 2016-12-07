module.exports = function (app, connection, csvParse, fs, moment, pool, config, http, JSFtp) {

	var mpanList = [{
		"id": 1,
		"mpan": "2100041172109",
		"solarGis": "SolarGIS_min15_6_Cowbridge_",
		"importMpan": "2100041172093",
		"pyroMinutes": 60000
	}, {
		"id": 2,
		"mpan": "2000055901355",
		"solarGis": "SolarGIS_min15_4_Poole_",
		"importMpan": "2000055901346",
		"pyroMinutes": 60000
	}, {
		"id": 3,
		"mpan": "2000055901300",
		"solarGis": "SolarGIS_min15_5_Lytchett_Minster_",
		"importMpan": "2000055901285",
		"pyroMinutes": 60000
	}, {
		"id": 4,
		"mpan": "1050000588215",
		"solarGis": "SolarGIS_min15_2_West_Caister_",
		"importMpan": "1050000588206",
		"pyroMinutes": 60000
	}, {
		"id": 5,
		"mpan": "2200042384200",
		"solarGis": "SolarGIS_min15_8_Canworthy_",
		"importMpan": "2200042384194",
		"pyroMinutes": 60000
	}, {
		"id": 6,
		"mpan": null
	}, {
		"id": 7,
		"mpan": "2000056147387"
	}, {
		"id": 8,
		"mpan": "1900091171276"
	}, {
		"id": 9,
		"mpan": "1900091178963"
	}, {
		"id": 10,
		"mpan": "1900091183411"
	}, {
		"id": 11,
		"mpan": "2200042480656",
		"solarGis": "SolarGIS_min15_9_Wilton_",
		"importMpan": "2200042480610",
		"pyroMinutes": 60000
	}, {
		"id": 12,
		"mpan": "2000056366930",
		"solarGis": "SolarGIS_min15_4_Poole_",
		"importMpan": "2000056366860",
		"pyroMinutes": 60000
	}, {
		"id": 13,
		"mpan": "2000056456265",
		"solarGis": "SolarGIS_min15_10_Merston_",
		"importMpan": "2000056456256",
		"pyroMinutes": 60000
	}, {
		"id": 14,
		"mpan": "1170000610807",
		"solarGis": "SolarGIS_min15_11_Ashby_",
		"importMpan": "1170000610791",
		"pyroMinutes": 4000
	}, {
		"id": 15,
		"mpan": "1640000523609",
		"solarGis": "SolarGIS_min15_7_Morecambe_",
		"importMpan": "1640000523593"
	}, {
		"id": 16,
		"mpan": "2000056474812",
		"solarGis": "SolarGIS_min15_12_Eveley_",
		"importMpan": "2000056474803",
		"pyroMinutes": 60000
	}];

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

	app.get(`/api/ftp/:id`, function (req, res) {
		let id = req.params.id;
		let fileName;
		let site = mpanList.filter(function (site) {
			return site.id == id;
		})[0];
		if (id === `NonHH`) {
			fileName = `Primrose Solar Limited NonHH.csv`;
		} else {
			fileName = `Primrose Solar Limited.csv`;
		}
		starkFtp.get(fileName, `./files/${fileName}`, function (hadErr) {
			if (hadErr) {
				console.error(`There was an error retrieving the file. ${hadErr}`);
				res.send(`There was an error retrieving the file. ${hadErr}`);
			} else {
				console.log(`File copied successfully!`);
				res.send(`File ${fileName} has been downloaded`);
			}
		});
	});

	app.get(`/api/solarGisFtp/:id`, function (req, res) {
		let id = req.params.id;
		let site = mpanList.filter(function (site) {
			return site.id == id;
		})[0];

		let day = moment().subtract(1, `days`).format(`YYYYMMDD`);
		let fileName = `${site.solarGis}${day}.csv`;

		solarGisFtp.get(`/CLIMDATA/${fileName}`, `./files/solarGis/${site.id}_${fileName}`, function (hadErr) {
			if (hadErr) {
				console.error(`There was an error retrieving the file. ${hadErr}`);
				res.send(`There was an error retrieving the file. ${hadErr}`);
			} else {
				console.log('File copied successfully!');
				res.send(`File ${fileName} has been downloaded`);
			}
		});
	});

	// upload solargis data to database tables export_# and dailySumExport
	app.get(`/api/mySQL/solarGisUpload/:id`, function (req, res) {

		let id = req.params.id;
		let site = mpanList.filter(function (site) {
			return site.id == id;
		})[0];
		let day = moment().subtract(1, 'days').format('YYYYMMDD');
		let mySQLDay = moment(day).format('YYYY-MM-DD');
		let filePath = `./files/solarGis/${id}_${site.solarGis}${day}.csv`;

		try {
			fs.readFile(filePath, {
				encoding: 'utf-8'
			}, function (err, csvData) {
				if (err) {
					console.log(err);
				}
				csvParse(csvData, {
					comment: '#',
					delimiter: ';'
				}, function (err, data) {
					if (err) {
						console.log(err);
					} else {
						let solarGisSum = 0;
						for (let j = 1; j < data.length; j++) {
							solarGisSum = solarGisSum + parseInt(data[j][4]);
						}
						solarGisSum = solarGisSum / 4000;
						connection.query(`INSERT INTO dailySolarGis (date, ps${id}) VALUES ('${mySQLDay}', ${solarGisSum}) on duplicate key update ps${id} = ${solarGisSum}; INSERT INTO dailyEsol (date, ps${id}) VALUES ('${mySQLDay}', ${solarGisSum}) on duplicate key update ps${site.id} = if(ps${site.id} > 0.000009, ps${id}, ${solarGisSum});`, function (err, result) {
							if (err) throw err;
							console.log(`Solargis upload for site PS${id}`);
							console.log(result);
							res.json({message:`Solargis data for PS${id} has been uploaded.`});
						}); //end connection.query
					}
				});
				try {
					fs.unlinkSync(filePath);
				} catch (err) {
					console.log(`fs.unlinkSync(filePath) did not work for ${filePath}`);
				}
			});
		} catch (err) {
			console.log(`fs.readFile(filePath) ${filePath}`);
		}
	});

		// upload exportimport to database tables export_# and dailySumExport
	app.get('/api/mySQL/upload/:type/:id', function (req, res) {

		let id = req.params.id;
		let type = req.params.type;
		let mpanType;
		if(req.params.type === `export`) {
			mpanType = 'mpan';
		} else {
			mpanType = 'importMpan';
		}
		let filePath = `./files/Primrose Solar Limited.csv`;
		let startIndex = 3;
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
					let readingsForExport = mpanList.map(function (mpan) {
						let readingsForOneExport = data.filter(function (item) {
							return item[0] === mpan[mpanType];
						});
						return {
							id: mpan.id,
							data: readingsForOneExport
						};
					});
					let site = readingsForExport.filter(function (site) {
						return site.id == id;
					})[0];
					let sqlInputData = [];
					let n = 0;
					for (let j = 0; j < site.data.length; j++) { // use this line only for histroical data
						let day = moment(site.data[j][startIndex - 1], `DD/MM/YYYY`).format(`YYYY-MM-DD`);
						let hour = moment(`00:30`, `HH:mm`).format(`HH:mm`);
						for (let i = startIndex; i < site.data[j].length; i++) {

							if (site.data[j][i] === `-`) {
								site.data[j][i] = `NULL`;
							}

							sqlInputData[n] = [`('${day}', '${hour}', ${site.data[j][i]})`];
							hour = moment(hour, `HH:mm`).add(30, `minutes`).format(`HH:mm`);
							n++;
						}
					}
					connection.query(`INSERT INTO ${type}_${id} VALUES ${sqlInputData} ON DUPLICATE KEY UPDATE generation=VALUES(generation); INSERT INTO dailySum${type.charAt(0).toUpperCase() + type.slice(1)} (date,PS${id}) SELECT date, SUM(generation) FROM ${type}_${id} WHERE date > NOW() - INTERVAL 30 DAY GROUP BY DATE ORDER BY date ASC ON DUPLICATE KEY UPDATE PS${id} = VALUES (PS${id});`, function (err, result) {
						if (err) {
							console.log(`ERROR ${type} upload file PS${id} : ${err}.`);
							res.json({message:`ERROR ${type} upload file PS${id}.`});
						} else {
							console.log(`Site: ${id} ; ${type}HHSQL: ${result[0].message}; ${type}DailySumSQL: ${result[1].message}`);
							res.json({message:`${type} data for PS${id} has been uploaded.`});
						}
					}); //end connection.query

				}
			});
		});
	});

	//manually upload csv files for import or export file.
	app.get('/api/mySQL/manualUpload/:type/:id', function (req, res) {
		let id = req.params.id;
		let type = req.params.type;
		let mpanType;
		if(req.params.type === `export`) {
			mpanType = 'mpan';
		} else {
			mpanType = 'importMpan';
		}
		let site = mpanList.filter(function (site) {
			return site.id == id;
		})[0];
		let filePath = `./files/${site[mpanType]}.csv`;
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
					let sqlInputData = [];
					let n = 0;

					for (j = 8; j < data.length; j++) { // use this line only for histroical data
						let day = moment(data[j][7], 'DD/MM/YYYY').format('YYYY-MM-DD');
						if (day === 'Invalid date') { continue; }
						for (i = 8; i < data[j].length; i++) {
							let hour = data[7][i];
							if (data[j][i] === `-`) {
								data[j][i] = `NULL`;
							}
							sqlInputData[n] = [`('${day}', '${hour}', ${data[j][i]})`];
							n++;
						}
					}
					connection.query(`INSERT INTO ${type}_${id} VALUES ${sqlInputData} ON DUPLICATE KEY UPDATE generation = VALUES(generation); insert into dailySum${type.charAt(0).toUpperCase() + type.slice(1)} (date,PS${id}) SELECT date, SUM(generation) FROM ${type}_${id} GROUP BY DATE ORDER BY DATE ASC ON DUPLICATE KEY UPDATE PS${id} = VALUES(PS${id});`, function (err, result) {
						if (err) {
							console.log(`ERROR ${type} upload file PS${id} : ${err}.`);
							res.json({message:`ERROR ${type} upload file PS${id}.`});
						} else {
							console.log(`Site: ${id} ; ${type}HHSQL: ${result[0].message}; ${type}DailySumSQL: ${result[1].message}`);
							res.json({message:`${type} data for PS${id} has been uploaded.`});
						}
					});
				}
			});
		});
	});

	// upload pyro data. Will grab a csv file from server that was previously uploaded and it will store the contents in to the specific site pyro table, and update the dailyEsol table
	app.get('/api/mySQL/pyroUpload/:id', function (req, res) {
		let id = req.params.id; //get ID from url
		let filePath = "./files/PS" + id + " Pyro.csv"; //locate correct CSV for uploading data
		let site = mpanList.filter(function (site) {
			return site.id == id;
		})[0]; //filter the correct site for extra params

		fs.readFile(filePath, { //start reading file
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
					let sqlInputData = []; //this array will store the data to send to query
					let sqlDupeText = []; //base text array for DUPLCIATE text of query
					let sqlValueText = []; //base text array for storing text for VALUE statement
					let sqlEsolText = []; //base text array for storing text for calculation on dailyEsol table
					let sqlEsolText2 = []; //base text array for storing text for calculation on dailyEsol table

					// loop through each row and get text ready for data to be uploaded to database tables
					for (let j = 1; j < data.length; j++) {
						if (data[j][0] === '') { continue; } // If there are any extra rows that contain no date/data, this will skip them
						let sqlText = ''; //base text variable for individual lines of CSV
						let day;
						//the below IFs will modify the date format to work with sql format YYYY-MM-DD HH:mm as different CSV files have different date formats
						if (moment(data[j][0], 'DD/MM/YYYY HH:mm', true).isValid()) {
							day = moment(data[j][0], 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
						} else {
							day = moment(data[j][0]).format('YYYY-MM-DD HH:mm');
						}

						sqlText = sqlText + `('${day}'`; //add in date that has been set up in correct format

						// loop through each column per row and add in data as different CSVS have different column numbers per row
						for (let k = 1; k < data[0].length; k++) {
							//loop through however many columns there are and get the text prepared for sql queries depending on column numbers.
							if (j === 1) {
								if (isNaN(data[0][k]) || data[0][k] === '') {
									sqlDupeText.push(`pyro_${k} = VALUES (pyro_${k})`);
									sqlValueText.push(`pyro_${k}`);
								} else {
									sqlDupeText.push('pyro_' + data[0][k] + '= VALUES (pyro_' + data[0][k] + ')');
									sqlValueText.push('pyro_' + data[0][k]);
								}
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
						//loop through however many columns there are and get the text prepared for sql queries depending on column numbers. This is seperated from the above as Canworthy is a unique case in that the uploaded file will have fewer columns than what is in database, so the INSERT TO ESOL table needs to be changed for this one site.
						let esolQueryLength;
						if (id == 5) {
							esolQueryLength = 5; // Although the number of pyros is 4, Ive used 5 as the FOR code only uses LESS THAN
						} else {
							esolQueryLength = data[0].length;
						}
						for (let m = 1; m < esolQueryLength; m++) {
							if (j === 1) {
								sqlEsolText.push('ifnull(pyro_' + m + ',0)');
								sqlEsolText2.push('(case when pyro_' + m + ' >= 0 then 1 else 0 end)');
							}
						}
						sqlText = sqlText + ')'; // this just adds a final bracket on the end of the text query
						sqlInputData.push(sqlText); // push the statement to the array of statements
					}
					// res.send('INSERT INTO pyro_site_' + id + ' (`dateTime`, ' + sqlValueText.join(', ') + ') VALUES ' + sqlInputData.join(', ') + ' ON DUPLICATE KEY UPDATE ' + sqlDupeText.join(', ') + '; INSERT INTO dailyEsol (date, ps' + id + ') SELECT date(dateTime), SUM((' + sqlEsolText.join(' + ') + ')/(' + sqlEsolText2.join(' + ') + '))/' + site.pyroMinutes + ' FROM pyro_site_' + id + ' WHERE date(dateTime) > NOW() - INTERVAL 14 DAY GROUP BY date(dateTime) ORDER BY dateTime DESC ON DUPLICATE KEY UPDATE PS' + id + ' = VALUES(ps' + id + ');');
					connection.query('INSERT INTO pyro_site_' + id + ' (`dateTime`, ' + sqlValueText.join(', ') + ') VALUES ' + sqlInputData.join(', ') + ' ON DUPLICATE KEY UPDATE ' + sqlDupeText.join(', ') + '; INSERT INTO dailyEsol (date, ps' + id + ') SELECT date(dateTime), SUM((' + sqlEsolText.join(' + ') + ')/(' + sqlEsolText2.join(' + ') + '))/' + site.pyroMinutes + ' FROM pyro_site_' + id + ' WHERE date(dateTime) > NOW() - INTERVAL 14 DAY GROUP BY date(dateTime) ORDER BY dateTime DESC ON DUPLICATE KEY UPDATE PS' + id + ' = VALUES(ps' + id + ');', function (err, result) {
						if (err) {
							res.send('id: ' + id + ' ; ' + err);
							console.log(err);
						} else {
							console.log(result);
							res.json({message:`Pyro data for PS${id} has been uploaded.`});
						}
					});
				}
			});
		});
	});

	function inverterUploadFunc(filePath) {
		var transformer = filePath.substring(36, 37);
		var combine = filePath.substring(59, 61);
		var inverter = filePath.substring(63, 64);
		var fullQuery = [];

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
					var currentGen, previousGen; //this too local vars will store the previous and current data values so they can calculate the diff value

					// collect data and format it in array to use in sqlquery
					for (var j = 1; j < data.length; j++) {
						//the below IFs will modify the date format to work with sql format YYYY-MM-DD HH:mm as different CSV files have different date formats
						if (moment(data[j][1], 'DD/MM/YYYY HH:mm', true).isValid()) {
							data[j][1] = moment(data[j][1], 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
						} else {
							data[j][1] = moment(data[j][1]).format('YYYY-MM-DD HH:mm');
						}
						var generation; // this stores the generation values to be sent to query
						if (j == 1) { //if the first in the loop then set all values to first/0
							previousGen = data[j][2];
							currentGen = data[j][2];
							generation = 0;
						}

						currentGen = data[j][2]; // get generation for current value of j
						if (currentGen - previousGen < 0) { //take previous value off current value to get the difference, unless value is negative then store 0
							generation = 0;
						} else {
							generation = currentGen - previousGen;
						}
						sqlInputData.push('("' + data[j][1] + '", ' + combine + ', ' + inverter + ', ' + generation + ')');
						previousGen = currentGen; // store currentGen as previousGen
					}
					connection.query('INSERT INTO inverter_generation_12_T' + transformer + ' VALUES ' + sqlInputData + ' ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_12_T' + transformer + ' where generation is null;', function (err, result) { //Run query to upload inverter data to table
						if (err) throw err;
						console.log('Done ' + filePath);
					});
				}
			});
		}); ///end fs.read
		// return 'Done ' + filePath;
	}

	// upload inverter data.
	app.get('/api/mySQL/invUpload/:id', function (req, res) {
		var id = req.params.id;
		var filePath = './files/PS' + id + ' Inv.csv';

		if (id == 12) {
			fs.readdir('./BedInverter', function (err, files) {
				if (err) {
					return res.status(500).json(err);
				}
				// res.json(files);
				res.send('working ');
				for (var i = 0; i < files.length; i++) {
					filePath = './BedInverter/' + files[i];
					inverterUploadFunc(filePath);
				}

			});
		} else {
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
						var j, time;
						if (id <= 4) {
							var transformerIndex; //create transformer index, name is linked to database table.
							var singleTransData = {};
							for (j = 1; j < data.length; j++) {
								time = data[j][0];
								for (var i = 1; i < data[0].length - 1; i++) {
									transformerIndex = 'inverter_generation_' + id + '_T' + data[0][i].substring(1, 3); //set var it db table name
									var combineBox = data[0][i].substring(7, 9); //set var to combine box number in column name
									var inverter = data[0][i].substring(13, 15); //set var to transformer number in column name
									var value = parseFloat(data[j][i]); //set var to value of kwh
									if (isNaN(value)) {
										value = 'NULL';
									}
									if (!singleTransData[transformerIndex]) { //check if array with database name exists and create if doesnt
										singleTransData[transformerIndex] = [];
									}
									singleTransData[transformerIndex].push('(\'' + time + '\', ' + combineBox + ', ' + inverter + ', ' + value + ')'); //push the VALUES query for each cell in to the correct object based on database table name
								}
							}
							// this now loops through an object and pushes all the data together in a string and pushes that string to an array.
							for (var key in singleTransData) {
								sqlInputData.push('INSERT INTO ' + key + ' VALUES ' + singleTransData[key].join(', ') + ' ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from ' + key + ' where generation is null;');
								console.log(key);
							}
							// once we have array with text of connection query, run query.
							// res.send(sqlInputData.join(' '));
							connection.query(sqlInputData.join(' '), function (err, result) {
								if (err) throw err;
								console.log('inverter upload for PS' + id + ' : ' + singleTransData['inverter_generation_' + id + '_T01'][0]);
								console.log(result);
								res.json({message:`Data for PS${id} has been uploaded.`});
							});
						} else { //how to query for all sites that arent using multiple tables
							// collect data and format it in array to use in sqlquery
							for (j = 1; j < data.length; j++) {
								var columnVal, value;
								var dateTime = moment(data[j][0], 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
								for (var i = 1; i <= data[j].length - 1; i++) {
									if (data[0][i] == '' || isNaN(data[0][i])) {
										columnVal = i;
									} else {
										columnVal = data[0][i];
									}
									value = parseFloat(data[j][i]);
									if (isNaN(value)) {
										value = 'NULL';
									} else if (value < 0) {
										value = 0;
									}
									sqlInputData.push('(\'' + dateTime + '\', ' + columnVal + ', ' + value + ')');
								}
							}
							connection.query('INSERT INTO inverter_generation_' + id + ' VALUES ' + sqlInputData + ' ON DUPLICATE KEY UPDATE generation=VALUES(generation); delete from inverter_generation_' + id + ' where generation is null;', function (err, result) { //Run query to upload inverter data to table
								if (err) throw err;
								console.log('inverter upload for PS' + id + ' : ');
								console.log(result);
								res.json({message:`Data for PS${id} has been uploaded.`});
							});
						}
					}
				});
			}); ///end fs.read
		}
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
