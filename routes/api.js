module.exports = function (app, connection) {


    // api for getting top level summary data of all sites
    app.get('/api/pickUp', function (req, res) {
        connection.query('SELECT id, name, tic_mwp from top_table', function (err, rows) {
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
        connection.query('SELECT name, id, latitude, longitude, location, tic_mwp, dnc_mw, homes_powered, carbon_saved_tones, (select epcName from epc where epcIndex = epc) as epc, dno, mpan_export from top_table where id = ' + id + ';', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });


    // get export generation
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

    // get pyro generation
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


    // get export generation for met office test
    app.get('/api/displaySite/report/:id', function (req, res) {
        var id = req.params.id;
        connection.query("select e.date, sum(generation) as generation, ps" + id + " * 1000 / (sum(case when generation > 0 then 0.5 else 0 end)) as avgPyro, sum(case when generation > 0 then 0.5 else 0 end) as opHours, ps" + id + " as esol, ps" + id + " * (select tic_mwp from top_table where id = " + id + " ) * 1000 as theoretical, sum(generation)/(ps" + id + " * (select tic_mwp from top_table where id = " + id + " ) * 1000) as pr from export_" + id + "  e join dailyEsol i on e.date = i.date group by e.date order by e.date desc;", function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });

    });

    app.get('/api/reports/incidents', function (req, res) {
        connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, (select value from incident_report_company where id = reported_by_company) as reported_by_company, (select value from incident_report_category where id = category) as category,(select value from incident_report_planned where id = planned) as planned, (select value from incident_report_generation_loss where id = loss_of_generation) as loss_of_generation, details, incident_report_number from incident_log where status = 1 and end_time > now();', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/reports/incidentsAll', function (req, res) {
        connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, (select value from incident_report_company where id = reported_by_company) as reported_by_company, (select value from incident_report_category where id = category) as category,(select value from incident_report_planned where id = planned) as planned, (select value from incident_report_generation_loss where id = loss_of_generation) as loss_of_generation, details, case when status = 1 then \'Open\' else \'Closed\' end as status,incident_report_number from incident_log order by date_logged desc;', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/reports/incidentsSite/:id', function (req, res) {
        var id = req.params.id;
        connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, (select value from incident_report_company where id = reported_by_company) as reported_by_company, (select value from incident_report_category where id = category) as category,(select value from incident_report_planned where id = planned) as planned, (select value from incident_report_generation_loss where id = loss_of_generation) as loss_of_generation, details, case when status = 1 then \'Open\' else \'Closed\' end as status, incident_report_number from incident_log where site = ' + id + ' order by date_logged desc;', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/reports/openIncidentsSite/:id', function (req, res) {
        var id = req.params.id;
        connection.query('select count(*) as `count` from incident_log where site = ' + id + ' and status = 1;', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/reports/incidentLog/:id', function (req, res) {
        var id = req.params.id;
        connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, (select value from incident_report_company where id = reported_by_company) as reported_by_company, (select value from incident_report_category where id = category) as category,(select value from incident_report_planned where id = planned) as planned, (select value from incident_report_generation_loss where id = loss_of_generation) as loss_of_generation, details, case when status = 1 then \'Open\' else \'Closed\' end as status,incident_report_number from incident_log where id = ' + id + ';', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/reports/incidentLogComments/:id', function (req, res) {
        var id = req.params.id;
        connection.query('select * from incident_comment where log_id = ' + id + ';', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });


    // Get data main display chart
    app.get('/api/displaySite/allSiteDaily/', function (req, res) {
        var selectedDate = "NOW()"
        connection.query("select date, ps1, ps2, ps3, ps4, ps5, ps7, ps8, ps9, ps10, ps11, ps12, ps13, ps15 from dailySumExport where (date between (" + selectedDate + " - INTERVAL 31 DAY) and " + selectedDate + ") order by date asc;", function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    // Get data main display chart
    app.get('/api/displaySite/allSiteDailyMWp/', function (req, res) {
        connection.query('select date, ps1/6.3 as `ps1`, ps2/9.272 as `ps2`, ps3/4.9030 as `ps3`, ps4/11.3140 as `ps4`,ps5/32.8 as `ps5`, ps7/39.9780 as `ps7`, ps8/14.96 as `ps8`, ps9/9.52 as `ps9`, ps10/14.96 as `ps10`, ps11/7.48 as `ps11`, ps12/4.04 as `ps12`, ps13/3.96 as `ps13`, ps15/3.96 as `ps15` from dailySumExport where (date between (NOW() - INTERVAL 31 DAY) and NOW()) order by date asc;', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    // Get data daily pyro chart
    app.get('/api/displaySite/allSiteDailyEsol/', function (req, res) {
        connection.query('select date, PS1, PS2, PS3, PS4, PS5, PS7, PS8, PS9, PS10, PS11 from dailyEsol where (date between (NOW() - INTERVAL 31 DAY) and NOW()) order by date asc;', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/mySQL/sumExport/:id', function (req, res) {
        var id = req.params.id;
        connection.query('insert into dailySumExport(date,PS' + id + ') select date, sum(generation) from export_' + id + ' where date > NOW() - INTERVAL 30 DAY group by date order by date asc on duplicate key update PS' + id + '=VALUES(PS' + id + ');', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/displaySite/allReport/', function (req, res) {
        connection.query('select sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) / sum(t.PS1_T01 + t.PS1_T02 + t.PS1_T03 + t.PS1_T04 + t.PS1_T05) as `PS01_avail`, sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) / sum(t.PS2_T01 + t.PS2_T02 + t.PS2_T03 + t.PS2_T04 + t.PS2_T05 + t.PS2_T06 + t.PS2_T07) as `PS02_avail`, sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) / sum(t.PS3_T01 + t.PS3_T02 + t.PS3_T03 + t.PS3_T04) as `PS03_avail`, sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) / sum(t.PS4_T01 + t.PS4_T02 + t.PS4_T03 + t.PS4_T04 + t.PS4_T05 + t.PS4_T06 + t.PS4_T07 + t.PS4_T08) as `PS04_avail`, sum(a.PS5) / sum(t.PS5) as `PS05_avail`, sum(a.PS7) / sum(t.PS7) as `PS07_avail`, sum(a.PS8) / sum(t.PS8) as `PS08_avail`, sum(a.PS9) / sum(t.PS9) as `PS09_avail`, sum(a.PS10) / sum(t.PS10) as `PS10_avail`, sum(a.PS11) / sum(t.PS11) as `PS11_avail`, sum(o.PS1_T01 + o.PS1_T02 + o.PS1_T03 + o.PS1_T04  + o.PS1_T05) / sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) as `PS01_Over0`, sum(o.PS2_T01 + o.PS2_T02 + o.PS2_T03 + o.PS2_T04 + o.PS2_T05 + o.PS2_T06 + o.PS2_T07) / sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) as `PS02_Over0`, sum(o.PS3_T01 + o.PS3_T02 + o.PS3_T03 + o.PS3_T04) / sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) as `PS03_Over0`, sum(o.PS4_T01 + o.PS4_T02 + o.PS4_T03 + o.PS4_T04 + o.PS4_T05 + o.PS4_T06 + o.PS4_T07 + o.PS4_T08) / sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) as `PS04_Over0`, sum(o.PS5) / sum(a.PS5) as `PS05_Over0`, sum(o.PS7) / sum(a.PS7) as `PS07_Over0`, sum(o.PS8) / sum(a.PS8) as `PS08_Over0`, sum(o.PS9) / sum(a.PS9) as `PS09_Over0`, sum(o.PS10) / sum(a.PS10) as `PS10_Over0`, sum(o.PS11) / sum(a.PS11) as `PS11_Over0`, sum(e.PS1) / sum(c.PS1 * (select tic_mwp from top_table where id = 1) * 1000) as `PS01_PR`, sum(e.PS2) / sum(c.PS2 * (select tic_mwp from top_table where id = 2) * 1000) as `PS02_PR`, sum(e.PS3) / sum(c.PS3 * (select tic_mwp from top_table where id = 3) * 1000) as `PS03_PR`, sum(e.PS4) / sum(c.PS4 * (select tic_mwp from top_table where id = 4) * 1000) as `PS04_PR`,sum(e.PS5) / sum(c.PS5 * (select tic_mwp from top_table where id = 5) * 1000) as `PS05_PR`,sum(e.PS7) / sum(c.PS7 * (select tic_mwp from top_table where id = 7) * 1000) as `PS07_PR`, sum(e.PS8) / sum(c.PS8 * (select tic_mwp from top_table where id = 8) * 1000) as `PS08_PR`, sum(e.PS9) / sum(c.PS9 * (select tic_mwp from top_table where id = 9) * 1000) as `PS09_PR`, sum(e.PS10) / sum(c.PS10 * (select tic_mwp from top_table where id = 10) * 1000) as `PS10_PR`, sum(e.PS11) / sum(c.PS11 * (select tic_mwp from top_table where id = 11) * 1000) as `PS11_PR`, sum(e.PS1) as `PS01_export`, sum(e.PS2) as `PS02_export`, sum(e.PS3) as `PS03_export`, sum(e.PS4) as `PS04_export`, sum(e.PS5) as `PS05_export`, sum(e.PS7) as `PS07_export`, sum(e.PS8) as `PS08_export`, sum(e.PS9) as `PS09_export`, sum(e.PS10) as `PS10_export`, sum(e.PS11) as `PS11_export` from dailySumExport e join dailySumInverterOver0 o on e.date = o.date join dailySumInverterAvailabilty a on e.date = a.date join dailySumInverterTimeDiff t on e.date = t.date join dailyEsol c on e.date = c.date where e.date <= (now() - interval 1 day) and e.date >= (now() - interval 15 day);', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/displaySite/reportSelect/:startDate/:endDate', function (req, res) {
        var startDate = req.params.startDate;
        var endDate = req.params.endDate;
        var spareDate;

        if (startDate > endDate) {
            spareDate = startDate;
            startDate = endDate;
            endDate = spareDate;
        }

        connection.query('select sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) / sum(t.PS1_T01 + t.PS1_T02 + t.PS1_T03 + t.PS1_T04 + t.PS1_T05) as `PS01_avail`, sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) / sum(t.PS2_T01 + t.PS2_T02 + t.PS2_T03 + t.PS2_T04 + t.PS2_T05 + t.PS2_T06 + t.PS2_T07) as `PS02_avail`, sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) / sum(t.PS3_T01 + t.PS3_T02 + t.PS3_T03 + t.PS3_T04) as `PS03_avail`, sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) / sum(t.PS4_T01 + t.PS4_T02 + t.PS4_T03 + t.PS4_T04 + t.PS4_T05 + t.PS4_T06 + t.PS4_T07 + t.PS4_T08) as `PS04_avail`, sum(a.PS5) / sum(t.PS5) as `PS05_avail`, sum(a.PS7) / sum(t.PS7) as `PS07_avail`, sum(a.PS8) / sum(t.PS8) as `PS08_avail`, sum(a.PS9) / sum(t.PS9) as `PS09_avail`, sum(a.PS10) / sum(t.PS10) as `PS10_avail`, sum(a.PS11) / sum(t.PS11) as `PS11_avail`, sum(o.PS1_T01 + o.PS1_T02 + o.PS1_T03 + o.PS1_T04  + o.PS1_T05) / sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) as `PS01_Over0`, sum(o.PS2_T01 + o.PS2_T02 + o.PS2_T03 + o.PS2_T04 + o.PS2_T05 + o.PS2_T06 + o.PS2_T07) / sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) as `PS02_Over0`, sum(o.PS3_T01 + o.PS3_T02 + o.PS3_T03 + o.PS3_T04) / sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) as `PS03_Over0`, sum(o.PS4_T01 + o.PS4_T02 + o.PS4_T03 + o.PS4_T04 + o.PS4_T05 + o.PS4_T06 + o.PS4_T07 + o.PS4_T08) / sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) as `PS04_Over0`, sum(o.PS5) / sum(a.PS5) as `PS05_Over0`, sum(o.PS7) / sum(a.PS7) as `PS07_Over0`, sum(o.PS8) / sum(a.PS8) as `PS08_Over0`, sum(o.PS9) / sum(a.PS9) as `PS09_Over0`, sum(o.PS10) / sum(a.PS10) as `PS10_Over0`, sum(o.PS11) / sum(a.PS11) as `PS11_Over0`, sum(e.PS1) / sum(c.PS1 * (select tic_mwp from top_table where id = 1) * 1000) as `PS01_PR`, sum(e.PS2) / sum(c.PS2 * (select tic_mwp from top_table where id = 2) * 1000) as `PS02_PR`, sum(e.PS3) / sum(c.PS3 * (select tic_mwp from top_table where id = 3) * 1000) as `PS03_PR`, sum(e.PS4) / sum(c.PS4 * (select tic_mwp from top_table where id = 4) * 1000) as `PS04_PR`,sum(e.PS5) / sum(c.PS5 * (select tic_mwp from top_table where id = 5) * 1000) as `PS05_PR`,sum(e.PS7) / sum(c.PS7 * (select tic_mwp from top_table where id = 7) * 1000) as `PS07_PR`, sum(e.PS8) / sum(c.PS8 * (select tic_mwp from top_table where id = 8) * 1000) as `PS08_PR`, sum(e.PS9) / sum(c.PS9 * (select tic_mwp from top_table where id = 9) * 1000) as `PS09_PR`, sum(e.PS10) / sum(c.PS10 * (select tic_mwp from top_table where id = 10) * 1000) as `PS10_PR`, sum(e.PS11) / sum(c.PS11 * (select tic_mwp from top_table where id = 11) * 1000) as `PS11_PR`, sum(e.PS1) as `PS01_export`, sum(e.PS2) as `PS02_export`, sum(e.PS3) as `PS03_export`, sum(e.PS4) as `PS04_export`, sum(e.PS5) as `PS05_export`, sum(e.PS7) as `PS07_export`, sum(e.PS8) as `PS08_export`, sum(e.PS9) as `PS09_export`, sum(e.PS10) as `PS10_export`, sum(e.PS11) as `PS11_export` from dailySumExport e left join dailySumInverterOver0 o on e.date = o.date left join dailySumInverterAvailabilty a on e.date = a.date left join dailySumInverterTimeDiff t on e.date = t.date left join dailyEsol c on e.date = c.date where (e.date between "' + startDate + '" and "' + endDate + '");', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/incidents/incidentSiteName/', function (req, res) {
        connection.query('select id, name from top_table;', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/incidents/incidentCategory/', function (req, res) {
        connection.query('select id, value from incident_report_category;', function (err, rows) {
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
        var year = req.params.month.substring(0, 4)
        var inverters = null;

        if (id == 1) {
            inverters = "sum(ps1_T01) + sum(ps1_T02) + sum(ps1_T03) + sum(PS1_T04) + sum(PS1_T05)";
        } else if (id == 2) {
            inverters = "sum(ps2_T01) + sum(ps2_T02) + sum(ps2_T03) + sum(PS2_T04) + sum(PS2_T05) + sum(PS2_T06) + sum(PS2_T07)";
        } else if (id == 3) {
            inverters = "sum(ps3_T01) + sum(ps3_T02) + sum(ps3_T03) + sum(PS3_T04)";
        } else if (id == 4) {
            inverters = "sum(ps4_T01) + sum(ps4_T02) + sum(ps4_T03) + sum(PS4_T04) + sum(PS4_T05) + sum(PS4_T06) + sum(PS4_T07) + sum(PS4_T08)";
        } else {
            inverters = "sum(ps" + id + ")";
        }


        connection.query('SELECT s.id, name, location, tic_mwp, dnc_mw, (select epcName from epc where epcIndex = epc) as epc, dno, mpan_export, panel_name, inverter_name, transformer_type, commissioning, pac, (select ps' + id + ' from monthlyPredictedGeneration where date_format(date, "%Y-%m") = "' + month + '") as pvsyst, (select sum(ps' + id + ') from monthlyPredictedGeneration where (date_format(date, "%Y") = "' + year + '") and (date_format(date, "%Y-%m") <= "' + month + '")) as pvsystYTD, (select sum(ps' + id + ') from dailySumExport where date_format(date, "%Y-%m") = "' + month + '") as export, (select sum(ps' + id + ') from dailyEsol where date_format(date, "%Y-%m") = "' + month + '") * tic_mwp * 1000 as theoretical, (select export) / (select theoretical) as pr, (select sum(ps' + id + ') from dailySumExport where date_format(date, "%Y") = "' + year + '") as exportYTD, (select sum(ps' + id + ') from dailyEsol where date_format(date, "%Y") = "' + year + '") * tic_mwp * 1000 as theoreticalYTD, (select exportYTD) / (select theoreticalYTD) as prYTD, (select ' + inverters + ' from dailySumInverterOver0 where date_format(date, "%Y-%m") = "' + month + '") / (select ' + inverters + ' from dailySumInverterTimeDiff where date_format(date, "%Y-%m") = "' + month + '") as availabilty, (select ' + inverters + ' from dailySumInverterOver0 where date_format(date, "%Y") = "' + year + '") / (select ' + inverters + ' from dailySumInverterTimeDiff where date_format(date, "%Y") = "' + year + '") as availabiltyYTD from top_table s join panelInfo p on s.id = p.site_id join inverterInfo i on s.id = i.site_id join transformerInfo t on s.id = t.site_id where s.id = ' + id + ' limit 1;', function (err, rows) {
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
        var year = req.params.month.substring(0, 4);
        connection.query('select m.date, ps' + id + ' as predicted, sum from monthlyPredictedGeneration m left join (select DATE_FORMAT(date, "%Y-%m") as date, sum(ps' + id + ') as sum from dailySumExport where DATE_FORMAT(date, "%Y-%m") <="' + month + '" group by year(date), month(date)) e on DATE_FORMAT(m.date, "%Y-%m") = e.date where year(m.date)="' + year + '";', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/displaySite/siteMonthIncidents/:id/:month', function (req, res) {
        var id = req.params.id;
        var month = req.params.month;
        connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, (select value from incident_report_company where id = reported_by_company) as reported_by_company, (select value from incident_report_category where id = category) as category,(select value from incident_report_planned where id = planned) as planned, (select value from incident_report_generation_loss where id = loss_of_generation) as loss_of_generation, details, case when status = 1 then \'Open\' else \'Closed\' end as status, incident_report_number from incident_log where site = ' + id + ' and date_format(date_logged, "%Y-%m") = "' + month + '";', function (err, rows) {
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

        connection.query('select e.date as date, g.ps' + id + ' / (select tic_mwp * 1000 from top_table where id = ' + id + ') / e.ps' + id + ' * 100 as prPvsyst, prActual, (select pr_guaranteed from top_table where id = ' + id + ') as prGuarantee from monthlyPredictedEsol e left join (select g.date, sum(g.ps' + id + ') / (sum(e.ps' + id + ') * (select tic_mwp from top_table where id = ' + id + ') * 1000) * 100 as prActual from dailySumExport g join dailyEsol e on g.date = e.date where date_format(g.date, "%Y-%m") <= "' + month + '" group by date_format(g.date, "%Y-%m")) a on e.date = a.date left join monthlyPredictedGeneration g on e.date = g.date where year(e.date) = "' + year + '";', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

    app.get('/api/displaySite/portfolioSiteInfo', function (req, res) {

        connection.query('select name, location, tic_mwp from top_table where primrose_company > 0;', function (err, rows) {
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
    
        app.get('/api/displaySite/portfolioSiteData', function (req, res) {

        connection.query('select date_format(p.date, "%Y-%m") as date, p.PS1 as pPS1, p.PS2 as pPS2, p.PS3 as pPS3, p.PS4 as pPS4, p.PS5 as pPS5, p.PS11 as pPS11, e.PS1 as pPS1, e.PS2 as ePS2, e.PS3 as ePS3, e.PS4 as ePS4, e.PS5 as ePS5, e.PS11 as ePS11, e.PS1 / p.PS1 as prPS1, e.PS2 / p.PS2 as prPS2, e.PS3 / p.PS3 as prPS3, e.PS4 / p.PS4 as prPS4, e.PS5 / p.PS5 as prPS5, e.PS11 / p.PS11 as prPS11, ifnull(p.PS11,0), e.PS1 + e.PS2 + e.PS3 + e.PS4 + e.PS5 + ifnull(e.PS11,0) as allActual, p.PS1 + p.PS2 + p.PS3 + p.PS4 + p.PS5 + ifnull(p.PS11,0) as allPredicted, (e.PS1 + e.PS2 + e.PS3 + e.PS4 + e.PS5 + ifnull(e.PS11,0)) / (p.PS1 + p.PS2 + p.PS3 + p.PS4 + p.PS5 + ifnull(p.PS11,0)) as allPR from monthlyPredictedGeneration p join (select date_format(date, "%Y-%m") as date, sum(PS1) as ps1,  sum(PS2) as ps2,  sum(PS3) as ps3, sum(PS4) as ps4, sum(PS5) as ps5, sum(PS11) as ps11, sum(PS12) as ps12, sum(PS13) as ps13 from dailySumExport group by date_format(date, "%Y-%m")) e on date_format(p.date, "%Y-%m") = e.date where date_format(p.date, "%Y") = "2015" and date_format(p.date, "%Y-%m") <= "2015-12";', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });
    
     app.get('/api/displaySite/portfolioSiteDataMonth', function (req, res) {

        connection.query('select date_format(p.date, "%Y-%m") as date, p.PS1 as pPS1, p.PS2 as pPS2, p.PS3 as pPS3, p.PS4 as pPS4, p.PS5 as pPS5, p.PS11 as pPS11, e.PS1 as pPS1, e.PS2 as ePS2, e.PS3 as ePS3, e.PS4 as ePS4, e.PS5 as ePS5, e.PS11 as ePS11, e.PS1 / p.PS1 as prPS1, e.PS2 / p.PS2 as prPS2, e.PS3 / p.PS3 as prPS3, e.PS4 / p.PS4 as prPS4, e.PS5 / p.PS5 as prPS5, e.PS11 / p.PS11 as prPS11, e.PS1 + e.PS2 + e.PS3 + e.PS4 + e.PS5 + ifnull(e.PS11,0) as allActual, p.PS1 + p.PS2 + p.PS3 + p.PS4 + p.PS5 + ifnull(p.PS11,0) as allPredicted, (e.PS1 + e.PS2 + e.PS3 + e.PS4 + e.PS5 + ifnull(e.PS11,0)) / (p.PS1 + p.PS2 + p.PS3 + p.PS4 + p.PS5 + ifnull(p.PS11,0)) as allPR from monthlyPredictedGeneration p join (select date_format(date, "%Y-%m") as date, sum(PS1) as ps1,  sum(PS2) as ps2,  sum(PS3) as ps3, sum(PS4) as ps4, sum(PS5) as ps5, sum(PS11) as ps11, sum(PS12) as ps12, sum(PS13) as ps13 from dailySumExport group by date_format(date, "%Y-%m")) e on date_format(p.date, "%Y-%m") = e.date where date_format(p.date, "%Y-%m") = "2015-12";', function (err, rows) {
            if (err) {
                return res.json(err);
            } else {
                return res.json(rows);
            }
        });
    });

};
