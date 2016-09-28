module.exports = function (app, connection) {


	// api for getting top level summary data of all sites
	app.get('/api/pickUp', function (req, res) {
		connection.query('SELECT id, name, tic_mwp, primrose_company from top_table where primrose_company > 0', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// api for getting summary of specific site
	app.get('/api/displaySite/site/:id', function (req, res) {
		var id = req.params.id;
		connection.query('SELECT name, id, latitude, longitude, location, tic_mwp, dnc_mw, homes_powered, carbon_saved_tones, (select epcName from epc where epcIndex = epc) as epc, dno, mpan_export, postcode from top_table where id = ' + id + ';', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// get export generation for GENERATION tab
	app.get('/api/displaySite/export/:id', function (req, res) {
		var id = req.params.id;
		connection.query('SELECT UNIX_TIMESTAMP(cast(`date` as datetime) + cast(`time` as time))*1000 as `timeU`, `generation` from  `export_' + id + '` where date > NOW() - INTERVAL 2 MONTH order by date asc;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// get pyro generation for GENERATION tab
	app.get('/api/displaySite/pyroMean/:id', function (req, res) {
		var id = req.params.id;
		if (id == 5) {
			connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0) + ifnull(avg(pyro_3),0) + ifnull(avg(pyro_4),0))/4,2) as `avgPyro` FROM pyro_site_' + id + ' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function (err, rows) {
				if (err) {
					return res.json(err);
				} else {
					return res.json(rows);
				}
			});
		} else if (id == 7) {
			connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),"") + ifnull(avg(pyro_2),"") + ifnull(avg(pyro_3),"") + ifnull(avg(pyro_4),"") + ifnull(avg(pyro_5),"") + ifnull(avg(pyro_6),"") + ifnull(avg(pyro_7),"")  + ifnull(avg(pyro_8),"") + ifnull(avg(pyro_9),"") + ifnull(avg(pyro_10),"") + ifnull(avg(pyro_11),"") + ifnull(avg(pyro_12),""))/12,2)  `avgPyro` FROM pyro_site_' + id + ' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function (err, rows) {
				if (err) {
					return res.json(err);
				} else {
					return res.json(rows);
				}
			});
		} else if (id == 11) {
			connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0) + ifnull(avg(pyro_3),0))/3,2) as `avgPyro` FROM pyro_site_' + id + ' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function (err, rows) {
				if (err) {
					return res.json(err);
				} else {
					return res.json(rows);
				}
			});
		} else {
			connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0))/2,2) as `avgPyro` FROM pyro_site_' + id + ' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function (err, rows) {
				if (err) {
					return res.json(err);
				} else {
					return res.json(rows);
				}
			});
		}
	});

	// display info for INSTALL tab
	app.get('/api/displaySite/install/:id', function (req, res) {
		var id = req.params.id;
		var queryInverter = 'select id, inverter_name, inverter_number, inverter_power, inverter_warranty from inverterInfo where id = ' + id + ' and active = 1;';
		var queryPanel = 'select id, panel_name, panel_number, panel_watt, panel_warranty, tilt from panelInfo where id = ' + id + ' and active = 1;';
		connection.query(queryPanel + queryInverter, function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// for the MKreport, DAILY STATS AND PR tab
	app.get('/api/displaySite/report/:id', function (req, res) {
		var id = req.params.id;
		var inverters = null;

		if (id == 1) {
			inverters = "ifnull(PS1_T01,0) + ifnull(PS1_T02,0) + ifnull(PS1_T03,0) + ifnull(PS1_T04,0) + ifnull(PS1_T05,0)";
		} else if (id == 2) {
			inverters = "ifnull(PS2_T01,0) + ifnull(PS2_T02,0) + ifnull(PS2_T03,0) + ifnull(PS2_T04,0) + ifnull(PS2_T05,0) + ifnull(PS2_T06,0) +ifnull(PS2_T07,0)";
		} else if (id == 3) {
			inverters = "ifnull(PS3_T01,0) + ifnull(PS3_T02,0) + ifnull(PS3_T03,0) + ifnull(PS3_T04,0)";
		} else if (id == 4) {
			inverters = "ifnull(PS4_T01,0) + ifnull(PS4_T02,0) + ifnull(PS4_T03,0) + ifnull(PS4_T04,0) + ifnull(PS4_T05,0) + ifnull(PS4_T06,0) + ifnull(PS4_T07,0) + ifnull(PS4_T08,0)";
		} else {
			inverters = "ifnull(PS" + id + ",0)";
		}
		connection.query('SELECT e.date, SUM(generation) AS generation, i.ps' + id + ' * 1000 / (SUM(CASE WHEN generation > 0 THEN 0.5 ELSE 0 END)) AS avgPyro, SUM(CASE WHEN generation > 0 THEN 0.5 ELSE 0 END) AS opHours, i.ps' + id + ' AS esol, i.ps' + id + ' * (SELECT tic_mwp FROM top_table WHERE id = ' + id + ') * 1000 AS theoretical, SUM(generation) / (i.ps' + id + ' * (SELECT tic_mwp FROM top_table WHERE id = ' + id + ') * 1000) AS pr, ia.ps' + id + ' / td.ps' + id + ' AS commsAvailabilty, oo.ps' + id + ' / ia.ps' + id + ' AS technicalAvailability, s.type FROM export_' + id + ' e left join (select date, site, type from alternativeInsolationData where site = ' + id + ') s on e.date = s.date LEFT JOIN dailyEsol i ON e.date = i.date LEFT JOIN (SELECT date, ' + inverters + ' as ps' + id + ' FROM dailySumInverterTimeDiff) td ON e.date = td.date LEFT JOIN (SELECT date, ' + inverters + ' as ps' + id + ' FROM dailySumInverterAvailabilty) ia ON e.date = ia.date LEFT JOIN (SELECT date, ' + inverters + ' as ps' + id + ' FROM dailySumInverterOver0) oo ON e.date = oo.date GROUP BY e.date ORDER BY e.date DESC;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data FRONT PAGE chart MONTHLY SUM
	app.get('/api/displaySite/allSiteDaily/', function (req, res) {
		var selectedDate = "NOW()";
		connection.query("select date, ps1, ps2, ps3, ps4, ps5, ps11, ps12, ps13, ps14, ps15, ps16 from dailySumExport where (date between (" + selectedDate + " - INTERVAL 31 DAY) and " + selectedDate + ") order by date asc;", function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data FRONT PAGE chart MONTHLY KWH/KWP
	app.get('/api/displaySite/allSiteDailyMWp/', function (req, res) {
		connection.query('select date, ps1/(select tic_mwp from top_table where id = 1) as `ps1`, ps2/(select tic_mwp from top_table where id = 2) as `ps2`, ps3/(select tic_mwp from top_table where id = 3) as `ps3`, ps4/(select tic_mwp from top_table where id = 4) as `ps4`,ps5/(select tic_mwp from top_table where id = 5) as `ps5`, ps11/(select tic_mwp from top_table where id = 11) as `ps11`, ps12/(select tic_mwp from top_table where id = 12) as `ps12`, ps13/(select tic_mwp from top_table where id = 13) as `ps13`, ps14/(select tic_mwp from top_table where id = 14) as `ps14`, ps15/(select tic_mwp from top_table where id = 15), ps16/(select tic_mwp from top_table where id = 16) as `ps16` from dailySumExport where (date between (NOW() - INTERVAL 31 DAY) and NOW()) order by date asc;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data FRONT PAGE chart ESOL
	app.get('/api/displaySite/allSiteDailyEsol/', function (req, res) {
		connection.query('select date, PS1, PS2, PS3, PS4, PS5, PS11, PS12, PS13, PS14, PS15, PS16 from dailyEsol where (date between (NOW() - INTERVAL 31 DAY) and NOW()) order by date asc;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// all site report between two dates, NOT CURRENTLY IN USE
	app.get('/api/displaySite/allReport/:startDate/:endDate', function (req, res) {
		var startDate = req.params.startDate;
		var endDate = req.params.endDate;
		var spareDate;
		if (startDate > endDate) {
			spareDate = startDate;
			startDate = endDate;
			endDate = spareDate;
		}
		connection.query('SELECT SUM(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) / SUM(t.PS1_T01 + t.PS1_T02 + t.PS1_T03 + t.PS1_T04 + t.PS1_T05) AS `PS01_avail`, SUM(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) / SUM(t.PS2_T01 + t.PS2_T02 + t.PS2_T03 + t.PS2_T04 + t.PS2_T05 + t.PS2_T06 + t.PS2_T07) AS `PS02_avail`, SUM(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) / SUM(t.PS3_T01 + t.PS3_T02 + t.PS3_T03 + t.PS3_T04) AS `PS03_avail`, SUM(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) / SUM(t.PS4_T01 + t.PS4_T02 + t.PS4_T03 + t.PS4_T04 + t.PS4_T05 + t.PS4_T06 + t.PS4_T07 + t.PS4_T08) AS `PS04_avail`, SUM(a.PS5) / SUM(t.PS5) AS `PS05_avail`, SUM(a.PS7) / SUM(t.PS7) AS `PS07_avail`, SUM(a.PS8) / SUM(t.PS8) AS `PS08_avail`, SUM(a.PS9) / SUM(t.PS9) AS `PS09_avail`, SUM(a.PS10) / SUM(t.PS10) AS `PS10_avail`, SUM(a.PS11) / SUM(t.PS11) AS `PS11_avail`, SUM(a.PS12) / SUM(t.PS12) AS `PS12_avail`, SUM(a.PS13) / SUM(t.PS13) AS `PS13_avail`, SUM(a.PS14) / SUM(t.PS14) AS `PS14_avail`, SUM(a.PS15) / SUM(t.PS15) AS `PS15_avail`, SUM(o.PS1_T01 + o.PS1_T02 + o.PS1_T03 + o.PS1_T04 + o.PS1_T05) / SUM(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) AS `PS01_Over0`, SUM(o.PS2_T01 + o.PS2_T02 + o.PS2_T03 + o.PS2_T04 + o.PS2_T05 + o.PS2_T06 + o.PS2_T07) / SUM(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) AS `PS02_Over0`, SUM(o.PS3_T01 + o.PS3_T02 + o.PS3_T03 + o.PS3_T04) / SUM(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) AS `PS03_Over0`, SUM(o.PS4_T01 + o.PS4_T02 + o.PS4_T03 + o.PS4_T04 + o.PS4_T05 + o.PS4_T06 + o.PS4_T07 + o.PS4_T08) / SUM(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) AS `PS04_Over0`, SUM(o.PS5) / SUM(a.PS5) AS `PS05_Over0`, SUM(o.PS7) / SUM(a.PS7) AS `PS07_Over0`, SUM(o.PS8) / SUM(a.PS8) AS `PS08_Over0`, SUM(o.PS9) / SUM(a.PS9) AS `PS09_Over0`, SUM(o.PS10) / SUM(a.PS10) AS `PS10_Over0`, SUM(o.PS11) / SUM(a.PS11) AS `PS11_Over0`, SUM(a.PS12) / SUM(t.PS12) AS `PS12_avail`, SUM(a.PS13) / SUM(t.PS13) AS `PS13_avail`, SUM(a.PS14) / SUM(t.PS14) AS `PS14_avail`, SUM(a.PS15) / SUM(t.PS15) AS `PS15_avail`, SUM(e.PS1) / SUM(c.PS1 * (SELECT  tic_mwp FROM top_table WHERE id = 1) * 1000) AS `PS01_PR`, SUM(e.PS2) / SUM(c.PS2 * (SELECT tic_mwp FROM top_table WHERE id = 2) * 1000) AS `PS02_PR`, SUM(e.PS3) / SUM(c.PS3 * (SELECT tic_mwp  FROM top_table WHERE id = 3) * 1000) AS `PS03_PR`, SUM(e.PS4) / SUM(c.PS4 * (SELECT tic_mwp FROM top_table WHERE id = 4) * 1000) AS `PS04_PR`,SUM(e.PS5) / SUM(c.PS5 * (SELECT tic_mwp FROM top_table WHERE id = 5) * 1000) AS `PS05_PR`, SUM(e.PS7) / SUM(c.PS7 * (SELECT tic_mwp FROM top_table WHERE id = 7) * 1000) AS `PS07_PR`, SUM(e.PS8) / SUM(c.PS8 * (SELECT  tic_mwp FROM top_table WHERE id = 8) * 1000) AS `PS08_PR`, SUM(e.PS9) / SUM(c.PS9 * (SELECT tic_mwp FROM top_table WHERE id = 9) * 1000) AS `PS09_PR`, SUM(e.PS10) / SUM(c.PS10 * (SELECT tic_mwp FROM top_table WHERE id = 10) * 1000) AS `PS10_PR`, SUM(e.PS11) / SUM(c.PS11 * (SELECT tic_mwp FROM top_table WHERE id = 11) * 1000) AS `PS11_PR`, SUM(e.PS12) / SUM(c.PS12 * (SELECT tic_mwp FROM top_table WHERE id = 12) * 1000) AS `PS12_PR`, SUM(e.PS13) / SUM(c.PS13 * (SELECT tic_mwp FROM top_table WHERE id = 13) * 1000) AS `PS13_PR`, SUM(e.PS14) / SUM(c.PS14 * (SELECT tic_mwp FROM top_table WHERE id = 14) * 1000) AS `PS14_PR`, SUM(e.PS15) / SUM(c.PS15 * (SELECT tic_mwp FROM top_table WHERE id = 15) * 1000) AS `PS15_PR`, SUM(e.PS1) AS `PS01_export`, SUM(e.PS2) AS `PS02_export`, SUM(e.PS3) AS `PS03_export`, SUM(e.PS4) AS `PS04_export`, SUM(e.PS5) AS `PS05_export`, SUM(e.PS7) AS `PS07_export`, SUM(e.PS8) AS `PS08_export`, SUM(e.PS9) AS `PS09_export`, SUM(e.PS10) AS `PS10_export`, SUM(e.PS11) AS `PS11_export`, SUM(e.PS12) AS `PS12_export`, SUM(e.PS13) AS `PS13_export`, SUM(e.PS14) AS `PS14_export`, SUM(e.PS15) AS `PS15_export` FROM dailySumExport e LEFT JOIN dailySumInverterOver0 o ON e.date = o.date LEFT JOIN dailySumInverterAvailabilty a ON e.date = a.date LEFT JOIN    dailySumInverterTimeDiff t ON e.date = t.date LEFT JOIN dailyEsol c ON e.date = c.date where (e.date between "' + startDate + '" and "' + endDate + '");', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/monthReport/:id/:month', function (req, res) {
		var id = req.params.id;
		var month = req.params.month;
		var year = req.params.month.substring(0, 4);
		var inverters = null;

		if (id == 1) {
			inverters = "sum(ifnull(PS1_T01,0)) + sum(ifnull(PS1_T02,0)) + sum(ifnull(PS1_T03,0)) + sum(ifnull(PS1_T04,0)) + sum(ifnull(PS1_T05,0))";
		} else if (id == 2) {
			inverters = "sum(ifnull(PS2_T01,0)) + sum(ifnull(PS2_T02,0)) + sum(ifnull(PS2_T03,0)) + sum(ifnull(PS2_T04,0)) + sum(ifnull(PS2_T05,0)) + sum(ifnull(PS2_T06,0)) + sum(ifnull(PS2_T07,0))";
		} else if (id == 3) {
			inverters = "sum(ifnull(PS3_T01,0)) + sum(ifnull(PS3_T02,0)) + sum(ifnull(PS3_T03,0)) + sum(ifnull(PS3_T04,0))";
		} else if (id == 4) {
			inverters = "sum(ifnull(PS4_T01,0)) + sum(ifnull(PS4_T02,0)) + sum(ifnull(PS4_T03,0)) + sum(ifnull(PS4_T04,0)) + sum(ifnull(PS4_T05,0)) + sum(ifnull(PS4_T06,0)) + sum(ifnull(PS4_T07,0)) + sum(ifnull(PS4_T08,0))";
		} else {
			inverters = "sum(ps" + id + ")";
		}

		connection.query('SELECT s.id, name, location, tic_mwp, dnc_mw, (select epcName from epc where epcIndex = epc) as epc, dno, mpan_export, panel_name, inverter_name, transformer_type, commissioning, pac, (select ps' + id + ' from monthlyPredictedGeneration where date_format(date, "%Y-%m") = "' + month + '") as pvsyst, (select sum(ps' + id + ') from monthlyPredictedGeneration where (date between "' + month + '-01" - INTERVAL 11 MONTH  AND "' + month + '-01")) as pvsystYTD, (select sum(ps' + id + ') from dailySumExport where date_format(date, "%Y-%m") = "' + month + '") as export, (select sum(ps' + id + ') from dailyEsol where date_format(date, "%Y-%m") = "' + month + '") * tic_mwp * 1000 as theoretical, (select export) / (select theoretical) as pr, (select sum(ps' + id + ') from dailySumExport where (date between "' + month + '-01" - INTERVAL 11 MONTH  AND "' + month + '-01")) as exportYTD, (select sum(ps' + id + ') from dailyEsol where (date between "' + month + '-01" - INTERVAL 11 MONTH  AND "' + month + '-01")) * tic_mwp * 1000 as theoreticalYTD, (select exportYTD) / (select theoreticalYTD) as prYTD, (select ' + inverters + ' from dailySumInverterOver0 where date_format(date, "%Y-%m") = "' + month + '") / (select ' + inverters + ' from dailySumInverterTimeDiff where date_format(date, "%Y-%m") = "' + month + '") as availabilty, (select ' + inverters + ' from dailySumInverterOver0 where (date between "' + month + '-01" - INTERVAL 11 MONTH  AND "' + month + '-01")) / (select ' + inverters + ' from dailySumInverterTimeDiff where (date between "' + month + '-01" - INTERVAL 11 MONTH  AND "' + month + '-01")) as availabiltyYTD from top_table s join panelInfo p on s.id = p.site_id join inverterInfo i on s.id = i.site_id join transformerInfo t on s.id = t.site_id where s.id = ' + id + ' limit 1;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data report display chart month
	app.get('/api/displaySite/siteMonthGeneration/:id/:month', function (req, res) {
		var id = req.params.id;
		var month = req.params.month;
		connection.query('select g.date, g.ps' + id + ' as generation, i.ps' + id + ' as esol, (select ps' + id + ' from monthlyPredictedGeneration where date_format(date, "%Y-%m") = "' + month + '") / (SELECT DAY(LAST_DAY(g.date))) as predictGen, (select ps' + id + ' from monthlyPredictedEsol where date_format(date, "%Y-%m") = "' + month + '") / (SELECT DAY(LAST_DAY(g.date))) as predictEsol from dailySumExport g join dailyEsol i on g.date = i.date where date_format(g.date, "%Y-%m") = "' + month + '" order by g.date asc;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data report display chart cumulative all
	app.get('/api/displaySite/siteMonthSumGeneration/:id/:month', function (req, res) {
		var id = req.params.id;
		var month = req.params.month;
		connection.query('select m.date, ps' + id + ' as predicted, sum from monthlyPredictedGeneration m left join (select DATE_FORMAT(date, "%Y-%m") as date, sum(ps' + id + ') as sum from dailySumExport where DATE_FORMAT(date, "%Y-%m") <="' + month + '" group by year(date), month(date)) e on DATE_FORMAT(m.date, "%Y-%m") = e.date where (m.date between "' + month + '-01" - INTERVAL 11 MONTH  AND "' + month + '-01");', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	app.get('/api/displaySite/siteMonthSumPR/:id/:month', function (req, res) {
		var id = req.params.id;
		var month = req.params.month;
		var year = req.params.month.substring(0, 4);

		connection.query('select e.date as date, g.ps' + id + ' / (select tic_mwp * 1000 from top_table where id = ' + id + ') / e.ps' + id + ' * 100 as prPvsyst, prActual, (select pr_guaranteed from top_table where id = ' + id + ') as prGuarantee from monthlyPredictedEsol e left join (select g.date, sum(g.ps' + id + ') / (sum(e.ps' + id + ') * (select tic_mwp from top_table where id = ' + id + ') * 1000) * 100 as prActual from dailySumExport g join dailyEsol e on g.date = e.date where date_format(g.date, "%Y-%m") <= "' + month + '" group by date_format(g.date, "%Y-%m")) a on e.date = a.date left join monthlyPredictedGeneration g on e.date = g.date where (e.date between "' + month + '-01" - INTERVAL 11 MONTH  AND "' + month + '-01");', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/portfolioSiteInfo', function (req, res) {

		connection.query('select id, name, location, tic_mwp, status, rocs from top_table where primrose_company > 0;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	app.get('/api/displaySite/portfolioAllSiteMwp', function (req, res) {

		connection.query('select sum(tic_mwp) as sumTic from top_table where primrose_company > 0;', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/portfolioSiteDataMonth/:month', function (req, res) {

		var month = req.params.month;

		connection.query('select pG.date, pG.ps1 as pPS1, pG.ps2 as pPS2, pG.ps3 as pPS3, pG.ps4 as pPS4, pG.ps5 as pPS5, pG.ps11 as pPS11, pG.ps12 as pPS12, pG.ps13 as pPS13, pG.ps14 as pPS14, pG.ps15 as pPS15, pG.ps16 as pPS16, (ifnull(pG.ps1,0) + ifnull(pG.ps2,0) + ifnull(pG.ps3,0) + ifnull(pG.ps4,0) + ifnull(pG.ps5,0) + ifnull(pG.ps11,0) + ifnull(pG.ps12,0) + ifnull(pG.ps13,0) + ifnull(pG.ps14,0) + ifnull(pG.ps15,0) + ifnull(pG.ps16,0)) as pPSAll, aG.ps1 as aPS1, aG.ps2 as aPS2, aG.ps3 as aPS3, aG.ps4 as aPS4, aG.ps5 as aPS5, aG.ps11 as aPS11, aG.ps12 as aPS12, aG.ps13 as aPS13, aG.ps14 as aPS14, aG.ps15 as aPS15, aG.ps16 as aPS16, (ifnull(aG.ps1,0) + ifnull(aG.ps2,0) + ifnull(aG.ps3,0) + ifnull(aG.ps4,0) + ifnull(aG.ps5,0) + ifnull(aG.ps11,0) + ifnull(aG.ps12,0) + ifnull(aG.ps13,0) + ifnull(aG.ps14,0) + ifnull(aG.ps15,0) + ifnull(aG.ps16,0)) as aPSAll, pG.ps1 / (pE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) as pPR1, pG.ps2 / (pE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) as pPR2, pG.ps3 / (pE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) as pPR3, pG.ps4 / (pE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) as pPR4, pG.ps5 / (pE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) as pPR5, pG.ps11 / (pE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) as pPR11, pG.ps12 / (pE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) as pPR12, pG.ps13 / (pE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) as pPR13, pG.ps14 / (pE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) as pPR14, pG.ps15 / (pE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) as pPR15, pG.ps16 / (pE.ps16 * (select tic_mwp * 1000 from top_table where id = 16)) as pPR16, (pG.ps1 + pG.ps2 + pG.ps3 + pG.ps4 + pG.ps5 + pG.ps11 + pG.ps12 + pG.ps13 + pG.ps14 + pG.ps15 + pG.ps16 ) / ((pE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) + (pE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) + (pE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) + (pE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) + (pE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) + (pE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) + (pE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) + (pE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) + (pE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) + (pE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) + (pE.ps16 * (select tic_mwp * 1000 from top_table where id = 16))) as pPRAll, aG.ps1 / (aE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) as aPR1, aG.ps2 / (aE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) as aPR2, aG.ps3 / (aE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) as aPR3, aG.ps4 / (aE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) as aPR4, aG.ps5 / (aE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) as aPR5, aG.ps11 / (aE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) as aPR11, aG.ps12 / (aE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) as aPR12, aG.ps13 / (aE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) as aPR13, aG.ps14 / (aE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) as aPR14, aG.ps15 / (aE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) as aPR15, aG.ps16 / (aE.ps16 * (select tic_mwp * 1000 from top_table where id = 16)) as aPR16, (aG.ps1 + aG.ps2 + aG.ps3 + aG.ps4 + aG.ps5 + aG.ps11 + aG.ps12 + aG.ps13 + aG.ps14 + aG.ps15 + aG.ps16) / ((aE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) + (aE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) + (aE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) + (aE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) + (aE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) + (aE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) + (aE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) + (aE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) + (aE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) + (aE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) + (aE.ps16 * (select tic_mwp * 1000 from top_table where id = 16))) as aPRAll from monthlyPredictedGeneration pG join monthlyPredictedEsol pE on pG.date = pE.date join (select date_format(date, "%Y-%m") as date, sum(ps1) as ps1, sum(ps2) as ps2, sum(ps3) as ps3, sum(ps4) as ps4, sum(ps5) as ps5, sum(ps11) as ps11, sum(ps12) as ps12, sum(ps13) as ps13, sum(ps14) as ps14, sum(ps15) as ps15, sum(ps16) as ps16 from dailySumExport group by date_format(date, "%Y-%m")) aG on date_format(pG.date, "%Y-%m") = aG.date join (select date_format(date, "%Y-%m") as date, sum(ps1) as ps1,  sum(ps2) as ps2, sum(ps3) as ps3, sum(ps4) as ps4, sum(ps5) as ps5, sum(ps11) as ps11, sum(ps12) as ps12, sum(ps13) as ps13, sum(ps14) as ps14, sum(ps15) as ps15, sum(ps16) as ps16 from dailyEsol group by date_format(date, "%Y-%m")) aE on date_format(pG.date, "%Y-%m") = aE.date where date_format(pG.date, "%Y-%m") = "' + month + '";', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/portfolioSiteEsolMonth/:month', function (req, res) {

		var month = req.params.month;

		connection.query('select date_format(p.date, "%Y-%m") as date, p.PS1 as pPS1, p.PS2 as pPS2, p.PS3 as pPS3, p.PS4 as pPS4, p.PS5 as pPS5, p.PS11 as pPS11, a.PS1 as aPS1, a.PS2 as aPS2, a.PS3 as aPS3, a.PS4 as aPS4, a.PS5 as aPS5, a.PS11 as aPS11 from monthlyPredictedEsol p join (Select date_format(date, "%Y-%m") as date, sum(PS1) as PS1, sum(PS2) as PS2, sum(PS3) as PS3, sum(PS4) as PS4, sum(PS5) as PS5, sum(PS11) as PS11 from dailyEsol group by date_format(date, "%Y-%m")) a on date_format(p.date, "%Y-%m") = a.date where date_format(p.date, "%Y-%m") = "' + month + '";', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/portfolioSiteDataYear/:month', function (req, res) {

		var month = req.params.month;

		connection.query('select date_format(p.date, "%Y-%m") as date, sum(p.PS1) as pPS1, sum(p.PS2) as pPS2, sum(p.PS3) as pPS3, sum(p.PS4) as pPS4, sum(p.PS5) as pPS5, sum(p.PS11) as pPS11, sum(p.PS12) as pPS12, sum(p.PS13) as pPS13, sum(p.PS14) as pPS14, sum(p.PS15) as pPS15, sum(p.PS16) as pPS16, sum(e.PS1) as ePS1, sum(e.PS2) as ePS2, sum(e.PS3) as ePS3, sum(e.PS4) as ePS4, sum(e.PS5) as ePS5, sum(e.PS11) as ePS11, sum(e.PS12) as ePS12, sum(e.PS13) as ePS13, sum(e.PS14) as ePS14, sum(e.PS15) as ePS15, sum(e.PS16) as ePS16 from monthlyPredictedGeneration p join (select date_format(date, "%Y-%m") as date, sum(PS1) as ps1, sum(PS2) as ps2, sum(PS3) as ps3, sum(PS4) as ps4, sum(PS5) as ps5, sum(PS11) as ps11, sum(PS12) as ps12, sum(PS13) as ps13, sum(PS14) as ps14, sum(PS15) as ps15, sum(PS16) as ps16 from dailySumExport group by date_format(date, "%Y-%m")) e on date_format(p.date, "%Y-%m") = e.date where p.date > concat("' + month + '-", (SELECT DAY(LAST_DAY("' + month + '-01")))) - interval 1 year and p.date <= concat("' + month + '-", (SELECT DAY(LAST_DAY("' + month + '-01"))));', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/portfolioAllDataYear/:month', function (req, res) {

		var month = req.params.month;

		connection.query('select pG.date, ifnull(pG.ps1,0) + ifnull(pG.ps2,0) + ifnull(pG.ps3,0) + ifnull(pG.ps4,0) + ifnull(pG.ps5,0) + ifnull(pG.ps11,0) + ifnull(pG.ps12,0) + ifnull(pG.ps13,0) + ifnull(pG.ps14,0) + ifnull(pG.ps15,0) + ifnull(pG.ps16,0) as predicted, ifnull(aG.ps1,0) + ifnull(aG.ps2,0) + ifnull(aG.ps3,0) + ifnull(aG.ps4,0) + ifnull(aG.ps5,0) + ifnull(aG.ps11,0) + ifnull(aG.ps12,0) + ifnull(aG.ps13,0) + ifnull(aG.ps14,0) + ifnull(aG.ps15,0) + ifnull(aG.ps16,0) as actual from monthlyPredictedGeneration pG join (select date_format(date, "%Y-%m") as date, sum(ps1) as ps1, sum(ps2) as ps2, sum(ps3) as ps3, sum(ps4) as ps4, sum(ps5) as ps5, sum(ps11) as ps11, sum(ps12) as ps12, sum(ps13) as ps13, sum(ps14) as ps14, sum(ps15) as ps15, sum(ps16) as ps16 from dailySumExport group by date_format(date, "%Y-%m")) aG on date_format(pG.date, "%Y-%m") = aG.date where (pG.date between "' + month + '-01" - interval 11 month and concat("' + month + '-", (SELECT DAY(LAST_DAY("' + month + '-01"))))) group by date_format(pG.date, "%Y-%m");', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/portfolioAllSiteDataYear/:month', function (req, res) {

		var month = req.params.month;

		connection.query('SELECT pG.date, IFNULL(pG.ps1, 0) as pgPS1, IFNULL(pG.ps2, 0) as pgPS2, IFNULL(pG.ps3, 0) as pgPS3, IFNULL(pG.ps4, 0) as pgPS4, IFNULL(pG.ps5, 0) as pgPS5, IFNULL(pG.ps11, 0) as pgPS11, IFNULL(pG.ps12, 0) as pgPS12, IFNULL(pG.ps13, 0) as pgPS13, IFNULL(pG.ps14, 0) as pgPS14, IFNULL(pG.ps15, 0) as pgPS15, IFNULL(pG.ps16, 0) as pgPS16, IFNULL(aG.ps1, 0) as agPS1, IFNULL(aG.ps2, 0) as agPS2, IFNULL(aG.ps3, 0) as agPS3, IFNULL(aG.ps4, 0) as agPS4, IFNULL(aG.ps5, 0) as agPS5, IFNULL(aG.ps11, 0) as agPS11, IFNULL(aG.ps12, 0) as agPS12, IFNULL(aG.ps13, 0) as agPS13, IFNULL(aG.ps14, 0) as agPS14, IFNULL(aG.ps15, 0) as agPS15, IFNULL(aG.ps16, 0) as agPS16 FROM monthlyPredictedGeneration pG JOIN (SELECT DATE_FORMAT(date, "%Y-%m") AS date, SUM(ps1) AS ps1, SUM(ps2) AS ps2, SUM(ps3) AS ps3, SUM(ps4) AS ps4, SUM(ps5) AS ps5, SUM(ps11) AS ps11, SUM(ps12) AS ps12, SUM(ps13) AS ps13, SUM(ps14) AS ps14, SUM(ps15) AS ps15, SUM(ps16) AS ps16 FROM dailySumExport GROUP BY DATE_FORMAT(date, "%Y-%m")) aG ON DATE_FORMAT(pG.date, "%Y-%m") = aG.date WHERE (pG.date BETWEEN "' + month + '-01" - INTERVAL 11 MONTH AND "' + month + '-01") GROUP BY DATE_FORMAT(pG.date, "%Y-%m");', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/portfolioAvailability/:month', function (req, res) {

		var month = req.params.month;

		connection.query('select sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) / sum(t.PS1_T01 + t.PS1_T02 + t.PS1_T03 + t.PS1_T04 + t.PS1_T05) as `PS01_avail`, sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) / sum(t.PS2_T01 + t.PS2_T02 + t.PS2_T03 + t.PS2_T04 + t.PS2_T05 + t.PS2_T06 + t.PS2_T07) as `PS02_avail`, sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) / sum(t.PS3_T01 + t.PS3_T02 + t.PS3_T03 + t.PS3_T04) as `PS03_avail`, sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) / sum(t.PS4_T01 + t.PS4_T02 + t.PS4_T03 + t.PS4_T04 + t.PS4_T05 + t.PS4_T06 + t.PS4_T07 + t.PS4_T08) as `PS04_avail`, sum(a.PS5) / sum(t.PS5) as `PS05_avail`,  sum(a.PS11) / sum(t.PS11) as `PS11_avail`, sum(o.PS1_T01 + o.PS1_T02 + o.PS1_T03 + o.PS1_T04  + o.PS1_T05) / sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) as `PS1_Over0`, sum(o.PS2_T01 + o.PS2_T02 + o.PS2_T03 + o.PS2_T04 + o.PS2_T05 + o.PS2_T06 + o.PS2_T07) / sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) as `PS2_Over0`, sum(o.PS3_T01 + o.PS3_T02 + o.PS3_T03 + o.PS3_T04) / sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) as `PS3_Over0`, sum(o.PS4_T01 + o.PS4_T02 + o.PS4_T03 + o.PS4_T04 + o.PS4_T05 + o.PS4_T06 + o.PS4_T07 + o.PS4_T08) / sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) as `PS4_Over0`, sum(o.PS5) / sum(a.PS5) as `PS5_Over0`, sum(o.PS11) / sum(a.PS11) as `PS11_Over0` from dailySumInverterOver0 o join dailySumInverterAvailabilty a on o.date = a.date join dailySumInverterTimeDiff t on o.date = t.date where (o.date between "' + month + '-01" - interval 1 month and concat("' + month + '-", (SELECT DAY(LAST_DAY("' + month + '-01")))));', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/displaySite/allSiteCoords', function (req, res) {
		connection.query('SELECT id, name, latitude, longitude FROM top_table WHERE primrose_company > 0', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get('/api/reports/dailyProductionReport/:date?', function (req, res) {
		var date1, date5;
		if (!req.params.date) {
			date1 = 'DATE(NOW() - INTERVAL 1 DAY)';
			date5 = 'DATE(NOW() - INTERVAL 5 DAY)';
		} else {
			date1 = '\'' + req.params.date + '\'';
			date5 = 'DATE(' + '\'' + req.params.date + '\'' + ' - INTERVAL 5 DAY)';
		}
		var groupings = [{ "id": 1, "name": "PS01" }, { "id": 2, "name": "PS02" }, { "id": 3, "name": "PS03" }, { "id": 4, "name": "PS04" }, { "id": 5, "name": "PS05" }, { "id": 11, "name": "PS11" }, { "id": 12, "name": "PS12" }, { "id": 13, "name": "PS13" }, { "id": 14, "name": "PS14" }, { "id": 15, "name": "PS15" }, { "id": 16, "name": "PS16" }];

		var requestText = '';
		var sumText = '';
		var singleText = '';

		groupings.forEach(function (element) {
			requestText = requestText + '(SELECT tic_mwp FROM top_table WHERE id = ' + element.id + ') as ' + element.name + '_Mwp, dg.ps' + element.id + ' AS ' + element.name + '_Day, gg.ps' + element.id + ' AS ' + element.name + '_Group, mp.ps' + element.id + ' / DAY(LAST_DAY(NOW() - INTERVAL 1 DAY)) AS ' + element.name + '_PredictDay, de.ps' + element.id + ' AS ' + element.name + '_DailyEsol, ge.ps' + element.id + ' AS ' + element.name + '_GroupEsol, dg.ps' + element.id + ' / (de.ps' + element.id + ' * (SELECT tic_mwp FROM top_table WHERE id = ' + element.id + ')*1000) AS ' + element.name + '_PR, gg.ps' + element.id + ' / (ge.ps' + element.id + ' * (SELECT tic_mwp FROM top_table WHERE id = ' + element.id + ')*1000) AS ' + element.name + '_GroupPR, ds.ps' + element.id + ' AS ' + element.name + '_DailySolarGis, gs.ps' + element.id + ' AS ' + element.name + '_GroupSolarGis, dg.ps' + element.id + ' / (ds.ps' + element.id + ' * (SELECT tic_mwp FROM top_table WHERE id = ' + element.id + ')*1000) AS ' + element.name + '_PRSolarGis, gg.ps' + element.id + ' / (gs.ps' + element.id + ' * (SELECT tic_mwp FROM top_table WHERE id = ' + element.id + ')*1000) AS ' + element.name + '_GroupPRSolarGis,';
		});

		groupings.forEach(function (element) {
			sumText = sumText + 'SUM(ps' + element.id + ') AS ps' + element.id + ',';
		});

		groupings.forEach(function (element) {
			singleText = singleText + 'ps' + element.id + ',';
		});

		requestText = requestText.slice(0, -1);
		sumText = sumText.slice(0, -1);
		singleText = singleText.slice(0, -1);

		connection.query('SELECT ' + requestText + ' FROM dailySumExport dg JOIN (SELECT ' + date1 + ' AS date, ' + sumText + ' FROM dailySumExport WHERE (date BETWEEN ' + date5 + '  AND ' + date1 + ')) gg ON dg.date = gg.date JOIN (SELECT date, ' + singleText + ' FROM monthlyPredictedGeneration WHERE YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW())) mp JOIN dailyEsol de on dg.date = de.date JOIN (SELECT ' + date1 + ' AS date, ' + sumText + ' FROM dailyEsol WHERE (date BETWEEN ' + date5 + ' AND ' + date1 + ')) ge ON dg.date = ge.date JOIN dailySolarGis ds on dg.date = ds.date JOIN (SELECT ' + date1 + ' AS date, ' + sumText + ' FROM dailySolarGis WHERE (date BETWEEN ' + date5 + '  AND ' + date1 + ')) gs ON dg.date = gs.date WHERE dg.date = ' + date1 + ';', function (err, rows) {
			if (err) {
				return res.json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	app.get('/api/reports/inverterGeneration/:id/:transformer?/:combineBox?', function (req, res) {
		var id = req.params.id;
		var transformer = req.params.transformer;
		var combineBox = req.params.combineBox;

		if (id == 15) {
			res.send('Coming soon --- hopefully');
		} else if (id > 5 && id < 11) { //these sites have been sold
			res.send('no longer here');
		} else if (id <= 4) { //conergy sites which have multiple tables per site for inverters
			var groupings = [{ 'id': 1, 'combine': [10, 8, 8, 8, 8] }, { 'id': 2, 'combine': [9, 10, 8, 10, 10, 9, 8] }, { 'id': 3, 'combine': [8, 8, 10, 8] }, { 'id': 4, 'combinecb': [8, 10, 10, 10, 10, 10, 10, 10] }]; //array of objects showing how many combine 'combine' are in each site 'id'. There are 10 inverters in each combine.
			var site = groupings.filter(function (site) { return site.id == id; })[0]; //select the correct array based on id
			var querySelectText = []; //array for text for querying
			var queryTableText = []; //array for text for querying table
			var queryTables = ' FROM inverter_generation_' + id + '_T0' + transformer + ' t ';

			for (var inverter = 1; inverter <= 10; inverter++) { //Loop through 10 inverters, there are 10 inverters on every combine box
				var AsInverter = ''; //this is used to make inverter names from single to double digits, ie 1 now 01, so that the inverters are ordered correctly in table
				if (inverter < 10) {
					AsInverter = '' + 0 + inverter;
				} else {
					AsInverter = inverter;
				}
				querySelectText.push('inverter_' + transformer + '_' + combineBox + '_' + AsInverter);
				queryTableText.push('ROUND(SUM(IF( t.inverter = ' + inverter + ' AND t.combine_box = ' + combineBox + ', t.generation, 0 )), 2 ) AS inverter_' + transformer + '_' + combineBox + '_' + AsInverter);
			}

			querySelectText = querySelectText.join(', '); //turn array in to string
			queryTableText = queryTableText.join(', '); //turn array in to string

			console.log('SELECT date, ' + querySelectText + ' FROM (SELECT t.dateTime AS date, ' + queryTableText + queryTables + ' where date(dateTime) > now() - interval 3 month GROUP BY date(t.dateTime), hour(t.dateTime) ORDER BY dateTime desc) AS sums;');
			connection.query('SELECT date, ' + querySelectText + ' FROM (SELECT t.dateTime AS date, ' + queryTableText + queryTables + ' where date(dateTime) > now() - interval 3 month GROUP BY date(t.dateTime), hour(t.dateTime) ORDER BY dateTime desc) AS sums;', function (err, rows) {
				if (err) {
					return res.json(err);
				} else {
					return res.json(rows);
				}
			});

		} else if (id == 12) {
			res.send('This may not work;');
		} else {
			var groupings = [{ 'id': 5, 'inv': 21 }, { 'id': 11, 'inv': 6 }, { 'id': 13, 'inv': 4 }, { 'id': 14, 'inv': 4 }, { 'id': 16, 'inv': 19 }]; //array of objects showing how many inverters 'inv' are in each site 'id'
			var site = groupings.filter(function (site) { return site.id == id; })[0];
			var querySelectText = 'inverter_01';
			var queryTableText = 'ROUND(SUM(If( inverter = 1, generation, 0 )), 2 ) AS inverter_01';

			for (var i = 2; i <= site.inv; i++) {
				var AsInverter = '';
				if (i < 10) {
					AsInverter = '' + 0 + i;
				} else {
					AsInverter = i;
				}
				querySelectText = querySelectText + ', inverter_' + AsInverter;
				queryTableText = queryTableText + ', ROUND(SUM(If( inverter = ' + i + ', generation, 0 )), 2 ) AS inverter_' + AsInverter;
			}
			connection.query('SELECT date, ' + querySelectText + ' FROM (SELECT dateTime AS date, ' + queryTableText + ' FROM inverter_generation_' + id + ' WHERE dateTime > now() - INTERVAL 31 DAY GROUP BY date(dateTime), hour(dateTime) ORDER BY dateTime DESC) AS sums;', function (err, rows) {
				if (err) {
					return res.json(err);
				} else {
					return res.json(rows);
				}
			});
		}
	});

};
