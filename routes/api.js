module.exports = function (app, connection, fs) {


	// api for getting top level summary data of all sites
	app.get(`/api/pickUp`, function (req, res) {
		connection.query(`SELECT id, name, tic_mwp, primrose_company from top_table where primrose_company > 0`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// api for getting summary of specific site
	app.get(`/api/displaySite/site/:id`, function (req, res) {
		let id = req.params.id;
		connection.query(`SELECT name, id, latitude, longitude, location, tic_mwp, dnc_mw, homes_powered, carbon_saved_tones, (select epcName from epc where epcIndex = epc) as epc, dno, mpan_export, postcode from top_table where id = ${id};`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	// get pyro generation data for GENERATION tab chart
	app.get(`/api/displaySite/chartData/:id`, function (req, res) {
		let id = req.params.id;
		let avgPyroText; // variable to use in query as number of pyros change based on site

		if (id === 5 || id === 11) {
			//then do 3
			avgPyroText = `round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0) + ifnull(avg(pyro_3),0))/3,2)`;
		} else if (id === 12 || id === 13) {
			// then do 4
			avgPyroText = `round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0) + ifnull(avg(pyro_3),0) + ifnull(avg(pyro_4),0))/4,2)`;
		} else if (id === 16) {
			// then do 6
			avgPyroText = `round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0) + ifnull(avg(pyro_3),0) + ifnull(avg(pyro_4),0) + ifnull(avg(pyro_5),0) + ifnull(avg(pyro_6),0))/6,2)`;
		} else {
			// do 2
			avgPyroText = `round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0))/2,2)`;
		}
		connection.query(`select UNIX_TIMESTAMP(timestamp(e.date, e.time))*1000 as timeU, e.generation, avgPyro from export_${id} e left join(select dateTime, ${avgPyroText} as avgPyro from pyro_site_${id} group by FLOOR((UNIX_TIMESTAMP(dateTime)) / 1800)) p on timestamp(e.date, e.time) = p.dateTime where e.date > date(now()) - interval 2 month order by timestamp(e.date, e.time) asc;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	// display info for INSTALL tab
	app.get(`/api/displaySite/install/:id`, function (req, res) {
		let id = req.params.id;
		let queryInverter = `select id, inverter_name, inverter_number, inverter_power, inverter_warranty from inverterInfo where id = ${id} and active = 1;`;
		let queryPanel = `select id, panel_name, panel_number, panel_watt, panel_warranty, tilt from panelInfo where id = ${id} and active = 1;`;
		connection.query(queryPanel + queryInverter, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// for the MKreport, DAILY STATS AND PR tab
	app.get(`/api/displaySite/report/:id`, function (req, res) {
		let id = req.params.id;
		let inverters = null;

		if (id == 1) {
			inverters = `ifnull(PS1_T01,0) + ifnull(PS1_T02,0) + ifnull(PS1_T03,0) + ifnull(PS1_T04,0) + ifnull(PS1_T05,0)`;
		} else if (id == 2) {
			inverters = `ifnull(PS2_T01,0) + ifnull(PS2_T02,0) + ifnull(PS2_T03,0) + ifnull(PS2_T04,0) + ifnull(PS2_T05,0) + ifnull(PS2_T06,0) +ifnull(PS2_T07,0)`;
		} else if (id == 3) {
			inverters = `ifnull(PS3_T01,0) + ifnull(PS3_T02,0) + ifnull(PS3_T03,0) + ifnull(PS3_T04,0)`;
		} else if (id == 4) {
			inverters = `ifnull(PS4_T01,0) + ifnull(PS4_T02,0) + ifnull(PS4_T03,0) + ifnull(PS4_T04,0) + ifnull(PS4_T05,0) + ifnull(PS4_T06,0) + ifnull(PS4_T07,0) + ifnull(PS4_T08,0)`;
		} else if (id == 12) {
			inverters = `ifnull(PS12_T1,0) + ifnull(PS12_T2,0)`;
		} else {
			inverters = `ifnull(PS${id},0)`;
		}
		connection.query(`SELECT e.date, SUM(generation) AS generation, i.ps${id} * 1000 / (SUM(CASE WHEN generation > 0 THEN 0.5 ELSE 0 END)) AS avgPyro, SUM(CASE WHEN generation > 0 THEN 0.5 ELSE 0 END) AS opHours, i.ps${id} AS esol, i.ps${id} * (SELECT tic_mwp FROM top_table WHERE id = ${id}) * 1000 AS theoretical, SUM(generation) / (i.ps${id} * (SELECT tic_mwp FROM top_table WHERE id = ${id}) * 1000) AS pr, ia.ps${id} / td.ps${id} AS commsAvailabilty, oo.ps${id} / ia.ps${id} AS technicalAvailability, s.type FROM export_${id} e left join (select date, site, type from alternativeInsolationData where site = ${id}) s on e.date = s.date LEFT JOIN dailyEsol i ON e.date = i.date LEFT JOIN (SELECT date, ${inverters} as ps${id} FROM dailySumInverterTimeDiff) td ON e.date = td.date LEFT JOIN (SELECT date, ${inverters} as ps${id} FROM dailySumInverterAvailabilty) ia ON e.date = ia.date LEFT JOIN (SELECT date, ${inverters} as ps${id} FROM dailySumInverterOver0) oo ON e.date = oo.date GROUP BY e.date ORDER BY e.date DESC;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data FRONT PAGE chart MONTHLY SUM
	app.get(`/api/displaySite/allSiteDaily/`, function (req, res) {
		// var selectedDate = "NOW()";
		connection.query(`select date, ps1, ps2, ps3, ps4, ps5, ps11, ps12, ps13, ps14, ps15, ps16 from dailySumExport where (date between (NOW() - INTERVAL 31 DAY) and NOW()) order by date asc;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data FRONT PAGE chart MONTHLY KWH/KWP
	app.get(`/api/displaySite/allSiteDailyMWp/`, function (req, res) {
		connection.query(`select date, ps1/(select tic_mwp from top_table where id = 1) as ps1, ps2/(select tic_mwp from top_table where id = 2) as ps2, ps3/(select tic_mwp from top_table where id = 3) as ps3, ps4/(select tic_mwp from top_table where id = 4) as ps4,ps5/(select tic_mwp from top_table where id = 5) as ps5, ps11/(select tic_mwp from top_table where id = 11) as ps11, ps12/(select tic_mwp from top_table where id = 12) as ps12, ps13/(select tic_mwp from top_table where id = 13) as ps13, ps14/(select tic_mwp from top_table where id = 14) as ps14, ps15/(select tic_mwp from top_table where id = 15) as ps15, ps16/(select tic_mwp from top_table where id = 16) as ps16 from dailySumExport where (date between (NOW() - INTERVAL 31 DAY) and NOW()) order by date asc;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data FRONT PAGE chart ESOL
	app.get(`/api/displaySite/allSiteDailyEsol/`, function (req, res) {
		connection.query(`select date, PS1, PS2, PS3, PS4, PS5, PS11, PS12, PS13, PS14, PS15, PS16 from dailyEsol where (date between (NOW() - INTERVAL 31 DAY) and NOW()) order by date asc;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	app.get(`/api/displaySite/monthReport/:id/:month`, function (req, res) {
		let id = req.params.id;
		let month = req.params.month;
		let inverters;

		if (id == 1) {
			inverters = `sum(ifnull(PS1_T01,0)) + sum(ifnull(PS1_T02,0)) + sum(ifnull(PS1_T03,0)) + sum(ifnull(PS1_T04,0)) + sum(ifnull(PS1_T05,0))`;
		} else if (id == 2) {
			inverters = `sum(ifnull(PS2_T01,0)) + sum(ifnull(PS2_T02,0)) + sum(ifnull(PS2_T03,0)) + sum(ifnull(PS2_T04,0)) + sum(ifnull(PS2_T05,0)) + sum(ifnull(PS2_T06,0)) + sum(ifnull(PS2_T07,0))`;
		} else if (id == 3) {
			inverters = `sum(ifnull(PS3_T01,0)) + sum(ifnull(PS3_T02,0)) + sum(ifnull(PS3_T03,0)) + sum(ifnull(PS3_T04,0))`;
		} else if (id == 4) {
			inverters = `sum(ifnull(PS4_T01,0)) + sum(ifnull(PS4_T02,0)) + sum(ifnull(PS4_T03,0)) + sum(ifnull(PS4_T04,0)) + sum(ifnull(PS4_T05,0)) + sum(ifnull(PS4_T06,0)) + sum(ifnull(PS4_T07,0)) + sum(ifnull(PS4_T08,0))`;
		} else if (id == 12) {
			inverters = `sum(ifnull(PS12_T1,0)) + sum(ifnull(PS12_T2,0))`;
		} else {
			inverters = `sum(ps${id})`;
		}
		connection.query(`SELECT s.id, name, location, tic_mwp, dnc_mw, (select epcName from epc where epcIndex = epc) as epc, dno, mpan_export, panel_name, inverter_name, transformer_type, commissioning, pac, (select ps${id} from monthlyPredictedGeneration where date_format(date, "%Y-%m") = "${month}") as pvsyst, (select sum(ps${id}) from monthlyPredictedGeneration where (date between "${month}-01" - INTERVAL 11 MONTH AND "${month}-01")) as pvsystYTD, (select sum(ps${id}) from dailySumExport where date_format(date, "%Y-%m") = "${month}") as export, (select sum(ps${id}) from dailyEsol where date_format(date, "%Y-%m") = "${month}") * tic_mwp * 1000 as theoretical, (select export) / (select theoretical) as pr, (select sum(ps${id}) from dailySumExport where (date between "${month}-01" - INTERVAL 11 MONTH  AND "${month}-01")) as exportYTD, (select sum(ps${id}) from dailyEsol where (date between "${month}-01" - INTERVAL 11 MONTH AND "${month}-01")) * tic_mwp * 1000 as theoreticalYTD, (select exportYTD) / (select theoreticalYTD) as prYTD, (select ${inverters} from dailySumInverterOver0 where date_format(date, "%Y-%m") = "${month}") / (select ${inverters} from dailySumInverterTimeDiff where date_format(date, "%Y-%m") = "${month}") as availabilty, (select ${inverters} from dailySumInverterOver0 where (date between "${month}-01" - INTERVAL 11 MONTH AND "${month}-01")) / (select ${inverters} from dailySumInverterTimeDiff where (date between "${month}-01" - INTERVAL 11 MONTH AND "${month}-01")) as availabiltyYTD from top_table s join panelInfo p on s.id = p.site_id join inverterInfo i on s.id = i.site_id join transformerInfo t on s.id = t.site_id where s.id = ${id} limit 1;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data report display chart month
	app.get(`/api/displaySite/siteMonthGeneration/:id/:month`, function (req, res) {
		let id = req.params.id;
		let month = req.params.month;
		connection.query(`select g.date, g.ps${id} as generation, i.ps${id} as esol, (select ps${id} from monthlyPredictedGeneration where date_format(date, "%Y-%m") = "${month}") / (SELECT DAY(LAST_DAY(g.date))) as predictGen, (select ps${id} from monthlyPredictedEsol where date_format(date, "%Y-%m") = "${month}") / (SELECT DAY(LAST_DAY(g.date))) as predictEsol from dailySumExport g join dailyEsol i on g.date = i.date where date_format(g.date, "%Y-%m") = "${month}" order by g.date asc;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	// Get data report display chart cumulative all
	app.get(`/api/displaySite/siteMonthSumGeneration/:id/:month`, function (req, res) {
		let id = req.params.id;
		let month = req.params.month;
		connection.query(`select m.date, ps${id} as predicted, sum from monthlyPredictedGeneration m left join (select DATE_FORMAT(date, "%Y-%m") as date, sum(ps${id}) as sum from dailySumExport where DATE_FORMAT(date, "%Y-%m") <="${month}" group by year(date), month(date)) e on DATE_FORMAT(m.date, "%Y-%m") = e.date where (m.date between "${month}-01" - INTERVAL 11 MONTH AND "${month}-01");`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	app.get(`/api/displaySite/siteMonthSumPR/:id/:month`, function (req, res) {
		let id = req.params.id;
		let month = req.params.month;

		connection.query(`select e.date as date, g.ps${id} / (select tic_mwp * 1000 from top_table where id = ${id}) / e.ps${id} * 100 as prPvsyst, prActual, (select pr_guaranteed from top_table where id = ${id}) as prGuarantee from monthlyPredictedEsol e left join (select g.date, sum(g.ps${id}) / (sum(e.ps${id}) * (select tic_mwp from top_table where id = ${id}) * 1000) * 100 as prActual from dailySumExport g join dailyEsol e on g.date = e.date where date_format(g.date, "%Y-%m") <= "${month}" group by date_format(g.date, "%Y-%m")) a on e.date = a.date left join monthlyPredictedGeneration g on e.date = g.date where (e.date between "${month}-01" - INTERVAL 11 MONTH AND "${month}-01");`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get(`/api/displaySite/portfolioSiteInfo`, function (req, res) {

		connection.query(`select id, name, location, tic_mwp, status, rocs from top_table where primrose_company > 0;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	app.get(`/api/displaySite/portfolioAllSiteMwp`, function (req, res) {

		connection.query(`select sum(tic_mwp) as sumTic from top_table where primrose_company > 0;`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get(`/api/displaySite/portfolioSiteDataMonth/:month`, function (req, res) {

		let month = req.params.month;

		connection.query(`select pG.date, pG.ps1 as pPS1, pG.ps2 as pPS2, pG.ps3 as pPS3, pG.ps4 as pPS4, pG.ps5 as pPS5, pG.ps11 as pPS11, pG.ps12 as pPS12, pG.ps13 as pPS13, pG.ps14 as pPS14, pG.ps15 as pPS15, pG.ps16 as pPS16, (ifnull(pG.ps1,0) + ifnull(pG.ps2,0) + ifnull(pG.ps3,0) + ifnull(pG.ps4,0) + ifnull(pG.ps5,0) + ifnull(pG.ps11,0) + ifnull(pG.ps12,0) + ifnull(pG.ps13,0) + ifnull(pG.ps14,0) + ifnull(pG.ps15,0) + ifnull(pG.ps16,0)) as pPSAll, aG.ps1 as aPS1, aG.ps2 as aPS2, aG.ps3 as aPS3, aG.ps4 as aPS4, aG.ps5 as aPS5, aG.ps11 as aPS11, aG.ps12 as aPS12, aG.ps13 as aPS13, aG.ps14 as aPS14, aG.ps15 as aPS15, aG.ps16 as aPS16, (ifnull(aG.ps1,0) + ifnull(aG.ps2,0) + ifnull(aG.ps3,0) + ifnull(aG.ps4,0) + ifnull(aG.ps5,0) + ifnull(aG.ps11,0) + ifnull(aG.ps12,0) + ifnull(aG.ps13,0) + ifnull(aG.ps14,0) + ifnull(aG.ps15,0) + ifnull(aG.ps16,0)) as aPSAll, pG.ps1 / (pE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) as pPR1, pG.ps2 / (pE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) as pPR2, pG.ps3 / (pE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) as pPR3, pG.ps4 / (pE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) as pPR4, pG.ps5 / (pE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) as pPR5, pG.ps11 / (pE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) as pPR11, pG.ps12 / (pE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) as pPR12, pG.ps13 / (pE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) as pPR13, pG.ps14 / (pE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) as pPR14, pG.ps15 / (pE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) as pPR15, pG.ps16 / (pE.ps16 * (select tic_mwp * 1000 from top_table where id = 16)) as pPR16, (pG.ps1 + pG.ps2 + pG.ps3 + pG.ps4 + pG.ps5 + pG.ps11 + pG.ps12 + pG.ps13 + pG.ps14 + pG.ps15 + pG.ps16 ) / ((pE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) + (pE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) + (pE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) + (pE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) + (pE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) + (pE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) + (pE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) + (pE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) + (pE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) + (pE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) + (pE.ps16 * (select tic_mwp * 1000 from top_table where id = 16))) as pPRAll, aG.ps1 / (aE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) as aPR1, aG.ps2 / (aE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) as aPR2, aG.ps3 / (aE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) as aPR3, aG.ps4 / (aE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) as aPR4, aG.ps5 / (aE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) as aPR5, aG.ps11 / (aE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) as aPR11, aG.ps12 / (aE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) as aPR12, aG.ps13 / (aE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) as aPR13, aG.ps14 / (aE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) as aPR14, aG.ps15 / (aE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) as aPR15, aG.ps16 / (aE.ps16 * (select tic_mwp * 1000 from top_table where id = 16)) as aPR16, (aG.ps1 + aG.ps2 + aG.ps3 + aG.ps4 + aG.ps5 + aG.ps11 + aG.ps12 + aG.ps13 + aG.ps14 + aG.ps15 + aG.ps16) / ((aE.ps1 * (select tic_mwp * 1000 from top_table where id = 1)) + (aE.ps2 * (select tic_mwp * 1000 from top_table where id = 2)) + (aE.ps3 * (select tic_mwp * 1000 from top_table where id = 3)) + (aE.ps4 * (select tic_mwp * 1000 from top_table where id = 4)) + (aE.ps5 * (select tic_mwp * 1000 from top_table where id = 5)) + (aE.ps11 * (select tic_mwp * 1000 from top_table where id = 11)) + (aE.ps12 * (select tic_mwp * 1000 from top_table where id = 12)) + (aE.ps13 * (select tic_mwp * 1000 from top_table where id = 13)) + (aE.ps14 * (select tic_mwp * 1000 from top_table where id = 14)) + (aE.ps15 * (select tic_mwp * 1000 from top_table where id = 15)) + (aE.ps16 * (select tic_mwp * 1000 from top_table where id = 16))) as aPRAll from monthlyPredictedGeneration pG join monthlyPredictedEsol pE on pG.date = pE.date join (select date_format(date, "%Y-%m") as date, sum(ps1) as ps1, sum(ps2) as ps2, sum(ps3) as ps3, sum(ps4) as ps4, sum(ps5) as ps5, sum(ps11) as ps11, sum(ps12) as ps12, sum(ps13) as ps13, sum(ps14) as ps14, sum(ps15) as ps15, sum(ps16) as ps16 from dailySumExport group by date_format(date, "%Y-%m")) aG on date_format(pG.date, "%Y-%m") = aG.date join (select date_format(date, "%Y-%m") as date, sum(ps1) as ps1,  sum(ps2) as ps2, sum(ps3) as ps3, sum(ps4) as ps4, sum(ps5) as ps5, sum(ps11) as ps11, sum(ps12) as ps12, sum(ps13) as ps13, sum(ps14) as ps14, sum(ps15) as ps15, sum(ps16) as ps16 from dailyEsol group by date_format(date, "%Y-%m")) aE on date_format(pG.date, "%Y-%m") = aE.date where date_format(pG.date, "%Y-%m") = "${month}";`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get(`/api/displaySite/portfolioSiteEsolMonth/:month`, function (req, res) {

		let month = req.params.month;

		connection.query(`select date_format(p.date, "%Y-%m") as date, p.PS1 as pPS1, p.PS2 as pPS2, p.PS3 as pPS3, p.PS4 as pPS4, p.PS5 as pPS5, p.PS11 as pPS11, a.PS1 as aPS1, a.PS2 as aPS2, a.PS3 as aPS3, a.PS4 as aPS4, a.PS5 as aPS5, a.PS11 as aPS11 from monthlyPredictedEsol p join (Select date_format(date, "%Y-%m") as date, sum(PS1) as PS1, sum(PS2) as PS2, sum(PS3) as PS3, sum(PS4) as PS4, sum(PS5) as PS5, sum(PS11) as PS11 from dailyEsol group by date_format(date, "%Y-%m")) a on date_format(p.date, "%Y-%m") = a.date where date_format(p.date, "%Y-%m") = "${month}";`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get(`/api/displaySite/portfolioSiteDataYear/:month`, function (req, res) {

		let month = req.params.month;

		connection.query(`select date_format(p.date, "%Y-%m") as date, sum(p.PS1) as pPS1, sum(p.PS2) as pPS2, sum(p.PS3) as pPS3, sum(p.PS4) as pPS4, sum(p.PS5) as pPS5, sum(p.PS11) as pPS11, sum(p.PS12) as pPS12, sum(p.PS13) as pPS13, sum(p.PS14) as pPS14, sum(p.PS15) as pPS15, sum(p.PS16) as pPS16, sum(e.PS1) as ePS1, sum(e.PS2) as ePS2, sum(e.PS3) as ePS3, sum(e.PS4) as ePS4, sum(e.PS5) as ePS5, sum(e.PS11) as ePS11, sum(e.PS12) as ePS12, sum(e.PS13) as ePS13, sum(e.PS14) as ePS14, sum(e.PS15) as ePS15, sum(e.PS16) as ePS16 from monthlyPredictedGeneration p join (select date_format(date, "%Y-%m") as date, sum(PS1) as ps1, sum(PS2) as ps2, sum(PS3) as ps3, sum(PS4) as ps4, sum(PS5) as ps5, sum(PS11) as ps11, sum(PS12) as ps12, sum(PS13) as ps13, sum(PS14) as ps14, sum(PS15) as ps15, sum(PS16) as ps16 from dailySumExport group by date_format(date, "%Y-%m")) e on date_format(p.date, "%Y-%m") = e.date where p.date > concat("${month}-", (SELECT DAY(LAST_DAY("${month}-01")))) - interval 1 year and p.date <= concat("${month}-", (SELECT DAY(LAST_DAY("${month}-01"))));`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get(`/api/displaySite/portfolioAllDataYear/:month`, function (req, res) {

		let month = req.params.month;

		connection.query(`select pG.date, ifnull(pG.ps1,0) + ifnull(pG.ps2,0) + ifnull(pG.ps3,0) + ifnull(pG.ps4,0) + ifnull(pG.ps5,0) + ifnull(pG.ps11,0) + ifnull(pG.ps12,0) + ifnull(pG.ps13,0) + ifnull(pG.ps14,0) + ifnull(pG.ps15,0) + ifnull(pG.ps16,0) as predicted, ifnull(aG.ps1,0) + ifnull(aG.ps2,0) + ifnull(aG.ps3,0) + ifnull(aG.ps4,0) + ifnull(aG.ps5,0) + ifnull(aG.ps11,0) + ifnull(aG.ps12,0) + ifnull(aG.ps13,0) + ifnull(aG.ps14,0) + ifnull(aG.ps15,0) + ifnull(aG.ps16,0) as actual from monthlyPredictedGeneration pG join (select date_format(date, "%Y-%m") as date, sum(ps1) as ps1, sum(ps2) as ps2, sum(ps3) as ps3, sum(ps4) as ps4, sum(ps5) as ps5, sum(ps11) as ps11, sum(ps12) as ps12, sum(ps13) as ps13, sum(ps14) as ps14, sum(ps15) as ps15, sum(ps16) as ps16 from dailySumExport group by date_format(date, "%Y-%m")) aG on date_format(pG.date, "%Y-%m") = aG.date where (pG.date between "${month}-01" - interval 11 month and concat("${month}-", (SELECT DAY(LAST_DAY("${month}-01"))))) group by date_format(pG.date, "%Y-%m");`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get(`/api/displaySite/portfolioAllSiteDataYear/:month`, function (req, res) {

		let month = req.params.month;

		connection.query(`SELECT pG.date, IFNULL(pG.ps1, 0) as pgPS1, IFNULL(pG.ps2, 0) as pgPS2, IFNULL(pG.ps3, 0) as pgPS3, IFNULL(pG.ps4, 0) as pgPS4, IFNULL(pG.ps5, 0) as pgPS5, IFNULL(pG.ps11, 0) as pgPS11, IFNULL(pG.ps12, 0) as pgPS12, IFNULL(pG.ps13, 0) as pgPS13, IFNULL(pG.ps14, 0) as pgPS14, IFNULL(pG.ps15, 0) as pgPS15, IFNULL(pG.ps16, 0) as pgPS16, IFNULL(aG.ps1, 0) as agPS1, IFNULL(aG.ps2, 0) as agPS2, IFNULL(aG.ps3, 0) as agPS3, IFNULL(aG.ps4, 0) as agPS4, IFNULL(aG.ps5, 0) as agPS5, IFNULL(aG.ps11, 0) as agPS11, IFNULL(aG.ps12, 0) as agPS12, IFNULL(aG.ps13, 0) as agPS13, IFNULL(aG.ps14, 0) as agPS14, IFNULL(aG.ps15, 0) as agPS15, IFNULL(aG.ps16, 0) as agPS16 FROM monthlyPredictedGeneration pG JOIN (SELECT DATE_FORMAT(date, "%Y-%m") AS date, SUM(ps1) AS ps1, SUM(ps2) AS ps2, SUM(ps3) AS ps3, SUM(ps4) AS ps4, SUM(ps5) AS ps5, SUM(ps11) AS ps11, SUM(ps12) AS ps12, SUM(ps13) AS ps13, SUM(ps14) AS ps14, SUM(ps15) AS ps15, SUM(ps16) AS ps16 FROM dailySumExport GROUP BY DATE_FORMAT(date, "%Y-%m")) aG ON DATE_FORMAT(pG.date, "%Y-%m") = aG.date WHERE (pG.date BETWEEN "${month}-01" - INTERVAL 11 MONTH AND "${month}-01") GROUP BY DATE_FORMAT(pG.date, "%Y-%m");`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});


	app.get(`/api/displaySite/allSiteCoords`, function (req, res) {
		connection.query(`SELECT id, name, latitude, longitude FROM top_table WHERE primrose_company > 0`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	// gets data the daily/5 day table All Site Report
	app.get(`/api/reports/dailyProductionReport/:date?`, function (req, res) {
		//set date1 to param date or default to yesterday
		let date1, date5;
		if (req.params.date) {
			date1 = `'${req.params.date}'`;
			date5 = `DATE('${req.params.date}' - INTERVAL 5 DAY)`;
		} else {
			date1 = `DATE(NOW() - INTERVAL 1 DAY)`;
			date5 = `DATE(NOW() - INTERVAL 5 DAY)`;
		}
		let groupings = [{
			"id": 1,
			"name": "PS01"
		}, {
			"id": 2,
			"name": "PS02"
		}, {
			"id": 3,
			"name": "PS03"
		}, {
			"id": 4,
			"name": "PS04"
		}, {
			"id": 5,
			"name": "PS05"
		}, {
			"id": 11,
			"name": "PS11"
		}, {
			"id": 12,
			"name": "PS12"
		}, {
			"id": 13,
			"name": "PS13"
		}, {
			"id": 14,
			"name": "PS14"
		}, {
			"id": 15,
			"name": "PS15"
		}, {
			"id": 16,
			"name": "PS16"
		}];
		// create array and loop through each item in object in GROUPINGS to set up the mysql text query, then join array to create string
		let requestText = [];
		groupings.forEach(function (element) {
			requestText.push(`(SELECT tic_mwp FROM top_table WHERE id = ${element.id}) as ${element.name}_Mwp, dg.ps${element.id} AS ${element.name}_Day, gg.ps${element.id} AS ${element.name}_Group, mp.ps${element.id} / DAY(LAST_DAY(NOW() - INTERVAL 1 DAY)) AS ${element.name}_PredictDay, de.ps${element.id} AS ${element.name}_DailyEsol, ge.ps${element.id} AS ${element.name}_GroupEsol, dg.ps${element.id} / (de.ps${element.id} * (SELECT tic_mwp FROM top_table WHERE id = ${element.id})*1000) AS ${element.name}_PR, gg.ps${element.id} / (ge.ps${element.id} * (SELECT tic_mwp FROM top_table WHERE id = ${element.id})*1000) AS ${element.name}_GroupPR, ds.ps${element.id} AS ${element.name}_DailySolarGis, gs.ps${element.id} AS ${element.name}_GroupSolarGis, dg.ps${element.id} / (ds.ps${element.id} * (SELECT tic_mwp FROM top_table WHERE id = ${element.id})*1000) AS ${element.name}_PRSolarGis, gg.ps${element.id} / (gs.ps${element.id} * (SELECT tic_mwp FROM top_table WHERE id = ${element.id})*1000) AS ${element.name}_GroupPRSolarGis`);
		});
		requestText = requestText.join(`, `);
		// create array and loop through each item in object in GROUPINGS to set up the mysql text query, then join array to create string
		let sumText = [];
		groupings.forEach(function (element) {
			sumText.push(`SUM(ps${element.id}) AS ps${element.id}`);
		});
		sumText = sumText.join(`, `);
		// create array and loop through each item in object in GROUPINGS to set up the mysql text query, then join array to create string
		let singleText = [];
		groupings.forEach(function (element) {
			singleText.push(`ps${element.id}`);
		});
		singleText = singleText.join(`, `);

		connection.query(`SELECT ${requestText} FROM dailySumExport dg JOIN (SELECT ${date1} AS date, ${sumText} FROM dailySumExport WHERE (date BETWEEN ${date5} AND ${date1})) gg ON dg.date = gg.date JOIN (SELECT date, ${singleText} FROM monthlyPredictedGeneration WHERE YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW())) mp JOIN dailyEsol de ON dg.date = de.date JOIN (SELECT ${date1} AS date, ${sumText} FROM dailyEsol WHERE (date BETWEEN ${date5} AND ${date1})) ge ON dg.date = ge.date JOIN dailySolarGis ds ON dg.date = ds.date JOIN (SELECT ${date1} AS date, ${sumText} FROM dailySolarGis WHERE (date BETWEEN ${date5} AND ${date1})) gs ON dg.date = gs.date WHERE dg.date = ${date1};`, function (err, rows) {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.json(rows);
			}
		});
	});

	app.get(`/api/reports/inverterGeneration/:id/:transformer?/:combineBox?`, function (req, res) {
		let id = req.params.id;
		let transformer = req.params.transformer;
		let combineBox = req.params.combineBox;
		let groupings = []; //this stores arrays of how many transformers and inverters at certain sites
		let querySelectText = []; //array for text for querying selecting
		let queryTableText = []; //array for text for querying table
		let queryTables;

		if (id == 15) {
			res.send('Coming soon --- hopefully');
		} else if (id > 5 && id < 11) { //these sites have been sold
			res.send('no longer here');
		} else if (id <= 4) { //conergy sites which have multiple tables per site for inverters
			groupings = [{
				'id': 1,
				'combine': [10, 8, 8, 8, 8]
			}, {
				'id': 2,
				'combine': [9, 10, 8, 10, 10, 9, 8]
			}, {
				'id': 3,
				'combine': [8, 8, 10, 8]
			}, {
				'id': 4,
				'combine': [8, 10, 10, 10, 10, 10, 10, 10]
			}]; //array of objects showing how many combine 'combine' are in each site 'id'. There are 10 inverters in each combine.
			let site = groupings.filter(function (site) {
				return site.id == id;
			})[0]; //select the correct array based on id
			queryTables = `FROM inverter_generation_${id}_T0${transformer} t `;

			for (let inverter = 1; inverter <= 10; inverter++) { //Loop through 10 inverters, there are 10 inverters on every combine box
				let AsInverter = ``; //this is used to make inverter names from single to double digits, ie 1 now 01, so that the inverters are ordered correctly in table
				if (inverter < 10) {
					AsInverter = `0${inverter}`;
				} else {
					AsInverter = inverter;
				}
				querySelectText.push(`inverter_${transformer}_${combineBox}_${AsInverter}`);
				queryTableText.push(`ROUND(SUM(IF( t.inverter = ${inverter} AND t.combine_box = ${combineBox}, t.generation, 0 )), 2 )/12 AS inverter_${transformer}_${combineBox}_${AsInverter}`);
			}

			querySelectText = querySelectText.join(`, `); //turn array in to string
			queryTableText = queryTableText.join(`, `); //turn array in to string
			connection.query(`SELECT date, ${querySelectText} FROM (SELECT t.dateTime AS date, ${queryTableText} ${queryTables} where date(dateTime) > now() - interval 3 month GROUP BY date(t.dateTime), hour(t.dateTime) ORDER BY dateTime desc) AS sums;`, function (err, rows) {
				if (err) {
					return res.status(500).json(err);
				} else {
					return res.json(rows);
				}
			});

		} else if (id == 12) {

			groupings = [
				[6, 6, 6, 6, 5, 6, 6, 5, 5, 6, 6, 6, 6, 6, 4, 5],
				[6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 4, 4, 6, 5]
			]; //array of objects showing how many inverters are in each combine box.
			queryTables = `FROM inverter_generation_${id}_T${transformer} t`;

			for (let inverter = 1; inverter <= groupings[transformer - 1][combineBox - 1]; inverter++) { //Loop through 10 inverters, there are 10 inverters on every combine box
				let AsInverter = ``; //this is used to make inverter names from single to double digits, ie 1 now 01, so that the inverters are ordered correctly in table
				if (inverter < 10) {
					AsInverter = `0${inverter}`;
				} else {
					AsInverter = inverter;
				}
				querySelectText.push(`inverter_${transformer}_${combineBox}_${AsInverter}`);
				queryTableText.push(`ROUND(SUM(IF(t.inverter = ${inverter} AND t.combine_box = ${combineBox}, t.generation, 0 )), 2 ) AS inverter_${transformer}_${combineBox}_${AsInverter}`);
			}

			querySelectText = querySelectText.join(`, `); //turn array in to string
			queryTableText = queryTableText.join(`, `); //turn array in to string
			console.log(`SELECT date, ${querySelectText} FROM (SELECT t.dateTime AS date, ${queryTableText} ${queryTables} where date(dateTime) > now() - interval 3 month GROUP BY date(t.dateTime), hour(t.dateTime) ORDER BY dateTime desc) AS sums;`);
			connection.query(`SELECT date, ${querySelectText} FROM (SELECT t.dateTime AS date, ${queryTableText} ${queryTables} where date(dateTime) > now() - interval 3 month GROUP BY date(t.dateTime), hour(t.dateTime) ORDER BY dateTime desc) AS sums;`, function (err, rows) {
				if (err) {
					return res.status(500).json(err);
				} else {
					return res.json(rows);
				}
			});
		} else {
			groupings = [{
				'id': 5,
				'inv': 21
			}, {
				'id': 11,
				'inv': 6
			}, {
				'id': 13,
				'inv': 4,
				'convert': '/60'
			}, {
				'id': 14,
				'inv': 4
			}, {
				'id': 16,
				'inv': 19
			}]; //array of objects showing how many inverters 'inv' are in each site 'id'
			let site = groupings.filter(function (site) {
				return site.id == id;
			})[0];
			let convertToMWh = ``; //this should be used used to convert to MWH on central inverters at 5 and 16

			if (id == 5 || id == 16) {
				convertToMWh = `/1000`;
			}

			for (let i = 1; i <= site.inv; i++) {
				let AsInverter = ``;
				if (i < 10) {
					AsInverter = `0${i}`;
				} else {
					AsInverter = i;
				}
				querySelectText.push(`inverter_${AsInverter}`);
				queryTableText.push(`ROUND(SUM(If(inverter = ${i}, generation, 0 ))${convertToMWh}, 2 )${site.convert || ''} AS inverter_${AsInverter}`);
			}
			querySelectText = querySelectText.join(`, `);
			queryTableText = queryTableText.join(`, `);
			connection.query(`SELECT date, ${querySelectText} FROM (SELECT dateTime AS date, ${queryTableText} FROM inverter_generation_${id} WHERE dateTime > now() - INTERVAL 31 DAY GROUP BY date(dateTime), hour(dateTime) ORDER BY dateTime DESC) AS sums;`, function (err, rows) {
				if (err) {
					return res.status(500).json(err);
				} else {
					return res.json(rows);
				}
			});
		}
	});

	// get list of files to be displayed in the file uplad page. Opitional PARAM value, defaults to 'files'
	app.get(`/api/getFiles/:folder?`, function (req, res) {
		let folder = req.params.folder || `files`;
		fs.readdir(`./${folder}`, function (err, files) {
			if (err) {
				return res.status(500).json(err);
			}
			res.json(files);
		});
	});

};