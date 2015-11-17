module.exports = function(app,connection) {


  // api for getting top level summary data of all sites
  app.get('/api/pickUp', function(req,res){
    connection.query('SELECT id, name, tic_mwp from top_table', function(err, rows) {
      // connection.query('SELECT id, mpan_export from top_table', function(err, rows) {
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // api for getting summary of specific site
  app.get('/api/displaySite/site/:id', function(req,res){
    var id = req.params.id;
    connection.query('SELECT name, id, latitude, longitude, location, tic_mwp, dnc_mw, homes_powered, carbon_saved_tones, epc from top_table where id = ?', [id], function(err, rows) {
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // api for getting inverter generation for specific site
  app.get('/api/displaySite/generation/:id', function(req,res){
    var id = req.params.id;
    connection.query('SELECT UNIX_TIMESTAMP(cast(`date` AS datetime) + cast(`time` as time))*1000 as `timeU`, `generation`, `inverter_number` from `inverter_site_generation_' + id + '` order by `inverter_number`, `timeU` ;',  function(err, rows) {
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // get export generation
  app.get('/api/displaySite/export/:id', function(req,res){
    var id = req.params.id;
    connection.query('SELECT UNIX_TIMESTAMP(cast(`date` as datetime) + cast(`time` as time))*1000 as `timeU`, `generation` from  `export_' + id +'` where date > NOW() - INTERVAL 2 MONTH order by date asc;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // get export generation
  app.get('/api/displaySite/pyroMean/:id', function(req,res){
    var id = req.params.id;
    if (id==5) {
      connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0) + ifnull(avg(pyro_3),0) + ifnull(avg(pyro_4),0))/4,2) as `avgPyro` FROM pyro_site_' + id +' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else if (id==7) {
      connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),"") + ifnull(avg(pyro_2),"") + ifnull(avg(pyro_3),"") + ifnull(avg(pyro_4),"") + ifnull(avg(pyro_5),"") + ifnull(avg(pyro_6),"") + ifnull(avg(pyro_7),"")  + ifnull(avg(pyro_8),"") + ifnull(avg(pyro_9),"") + ifnull(avg(pyro_10),"") + ifnull(avg(pyro_11),"") + ifnull(avg(pyro_12),""))/12,2)  `avgPyro` FROM pyro_site_' + id +' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else if (id==11) {
      connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0) + ifnull(avg(pyro_3),0))/3,2) as `avgPyro` FROM pyro_site_' + id +' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else {

      connection.query('SELECT ROUND(UNIX_TIMESTAMP(dateTime)/(30 * 60)) AS timekey, UNIX_TIMESTAMP(datetime)*1000 as `timeU`, round((ifnull(avg(pyro_1),0) + ifnull(avg(pyro_2),0))/2,2) as `avgPyro` FROM pyro_site_' + id +' where date(dateTime) > NOW() - INTERVAL 2 MONTH GROUP BY timekey;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    }
  });

  // get export generation for met office test
  app.get('/apiTestSite/displaySite/export/:id', function(req,res){
    var id = req.params.id;
    connection.query('SELECT `date`, `time`, `generation` from  `export_' + id +'` where date = "2015-06-01";', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // Get the epc info.
  app.get('/api/displaySite/epc/:id', function(req,res){
    var id = req.params.id;
    connection.query('SELECT top_table.id, epc.epcName from top_table left join epc on top_table.epc = epc.epcIndex where id = ' + id + ';', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/displaySite/admin/:id', function(req,res){
    var id = req.params.id;
    connection.query('SELECT id, dno, mpan_export from top_table where id = ' + id + ';', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/displaySite/install/:id', function(req,res){
    var id = req.params.id;
    var queryInverter = 'select id, inverter_name, inverter_number, inverter_power, inverter_warranty from inverterInfo where id = ' + id + ' and active = 1;';
    var queryPanel = 'select id, panel_name, panel_number, panel_watt, panel_warranty, tilt from panelInfo where id = ' + id + ' and active = 1;';

    connection.query(queryPanel+queryInverter, function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // get export generation for met office test
  app.get('/api/displaySite/pyro/:id', function(req,res){
    var id = req.params.id;
    connection.query('SELECT UNIX_TIMESTAMP(dateTime) * 1000 as `timeU`, if(pyro_1 = 0, 0, if(pyro_1>greatest(pyro_1,pyro_2)*0.6,pyro_1,"")) as `pyro_mod_1`, if(pyro_1 = 0, 0, if(pyro_2>greatest(pyro_1,pyro_2)*0.6,pyro_2,"")) as `pyro_mod_2`, (if(pyro_1 = 0, 0, if(pyro_1>greatest(pyro_1,pyro_2)*0.6,pyro_1,""))+if(pyro_2 = 0, 0, if(pyro_2>greatest(pyro_1,pyro_2)*0.6,pyro_2,""))) as `pyro_mod_sum`, (select(pyro_mod_1) <>"") + (select(pyro_mod_2) <>"") as `count`, (select(`pyro_mod_sum`)) / (select(`count`)) as `average` from  `pyro_site_' + id +'`;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // get export generation for met office test
  app.get('/api/displaySite/report/:id', function(req,res){
    var id = req.params.id;
    if (id == 5) {
      connection.query('select e.date, round(sum(generation),2) as `export`, a.pyro_1, a.pyro_2, a.pyro_3, a.pyro_4, round((a.pyro_1 + a.pyro_2 + a.pyro_3 + a.pyro_4) /(ifnull((pyro_1 <> ""), 0) + ifnull((pyro_2 <> ""), 0) + ifnull((pyro_3 <> ""), 0) + ifnull((pyro_4 <> ""), 0)),2)  as `pyroMean`, SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5 as `opHours`, round((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000,2) as `esol`, round(((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') *1 * 0.996,2) as `theoretical`, format(sum(generation) / (((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') *1 * 0.996),4,"%") as `PR` from `export_' + id +'` e left join `avg_day_pyro_site_' + id +'` a on e.date = a.date group by date order by date desc;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else if (id == 11) {
      connection.query('select e.date, round(sum(generation),2) as `export`, a.pyro_1, a.pyro_2, a.pyro_3, round((a.pyro_1 + a.pyro_2 + a.pyro_3) /(ifnull((pyro_1 <> ""), 0) + ifnull((pyro_3 <> ""), 0) + ifnull((pyro_3 <> ""), 0)),2)  as `pyroMean`, SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5 as `opHours`, round((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000,2) as `esol`, round(((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') *1 * 0.996,2) as `theoretical`, format(sum(generation) / (((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') *1 * 0.996),4,"%") as `PR` from `export_' + id +'` e left join `avg_day_pyro_site_' + id +'` a on e.date = a.date group by date order by date desc; ', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else if (id == 7) {
      connection.query('select e.date, round(sum(generation),2) as `export`, a.pyro_1, a.pyro_2, a.pyro_3, a.pyro_4, a.pyro_5, a.pyro_6, a.pyro_7, a.pyro_8, a.pyro_9, a.pyro_10, a.pyro_11, a.pyro_12, round((a.pyro_1 + a.pyro_2 + a.pyro_3 + a.pyro_4 + pyro_5 + pyro_6 + a.pyro_7 + a.pyro_8 + a.pyro_9 + a.pyro_10 + a.pyro_11 + a.pyro_12) /(ifnull((pyro_1 <> ""), 0) + ifnull((pyro_2 <> ""), 0) + ifnull((pyro_3 <> ""), 0) + ifnull((pyro_4 <> ""), 0) + ifnull((pyro_5 <> ""), 0) + ifnull((pyro_6 <> ""), 0) + ifnull((pyro_7 <> ""), 0) + ifnull((pyro_8 <> ""), 0) + ifnull((pyro_9 <> ""), 0) + ifnull((pyro_10 <> ""), 0) + ifnull((pyro_11 <> ""), 0) + ifnull((pyro_12 <> ""), 0)),2)  as `pyroMean`, SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5 as `opHours`, round((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000,2) as `esol`, round(((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') * 1 * 0.996,2) as `theoretical`, format(sum(generation) / (((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') *1 * 0.996),4,"%") as `PR` from `export_' + id +'` e left join `avg_day_pyro_site_' + id +'` a on e.date = a.date group by date order by date desc;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else {
      connection.query('select e.date, sum(generation) as `export`, if(a.pyro_1 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_1,"") as `mod 1`, if(a.pyro_2 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_2,"") as `mod 2`, round((if(a.pyro_1 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_1,"") + if(a.pyro_2 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_2,"")) / (ifnull(((select `mod 1`) <> ""), 0) + ifnull(((select `mod 2`) <> ""), 0)),2) as `pyroMean`, round(SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5,2) as `opHours`, round((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000,2) as `esol`, round(((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') * 1 * 0.996,2) as `theoretical`, format(sum(generation) / (((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') * 1 * 0.996),4,"%") as `PR` from `export_' + id +'` e left join `avg_day_pyro_site_' + id +'` a on e.date = a.date group by date order by date desc;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    }
  });

  // get data for report using RAW pyro test
  app.get('/api/displaySite/reportRaw/:id', function(req,res){
    var id = req.params.id;
    var minutes;
    if (id <=4)  {
      minutes = 60000;
    } else {
      minutes = 12000;
    }
    if (id == 7) {
      connection.query('select date(dateTime) as `date`, sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' as `esol`, sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996 as `theoretical`, sum(generation) as `generation`, sum(generation)/(sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996) as `PR` from `pyro_site_' + id +'` p left join export_' + id +' e on p.datetime = e.date group by date(dateTime) order by date desc;', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });

    } else {

    connection.query('select date(dateTime) as `date`, sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' as `esol`, sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996 as `theoretical`, sum(generation) as `generation`, sum(generation)/(sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996) as `PR` from `pyro_site_' + id +'` p left join export_' + id +' e on p.datetime = e.date group by date(dateTime) order by date desc;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
    }
  });

  // get data for report using over 50 pyro test
  app.get('/api/displaySite/reportOver/:id', function(req,res){
    var id = req.params.id;
    var minutes;
    if (id <=4)  {
      minutes = 60000;
    } else {
      minutes = 12000;
    }
    connection.query('select date(dateTime) as `date`, sum((if(pyro_1>50,pyro_1,"") + if(pyro_2>50,pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' as `esol`, sum((if(pyro_1>50,pyro_1,"") + if(pyro_2>50,pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996 as `theoretical`, sum(generation) as `generation`, sum(generation)/(sum((if(pyro_1>50,pyro_1,"") + if(pyro_2>50,pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996) as `PR` from `pyro_site_' + id +'` p left join export_' + id +' e on p.datetime = e.date group by year(dateTime), month(dateTime) order by date desc;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  // get data for report using over SD pyro test
  app.get('/api/displaySite/reportSD/:id', function(req,res){
    var id = req.params.id;
    var minutes;
    if (id <=4)  {
      minutes = 60000;
    } else {
      minutes = 12000;
    }
    connection.query('select date(dateTime) as `date`, sum(generation) as `generation`, sum((if(pyro_1 > greatest(ifnull(pyro_1, ""),ifnull(pyro_2, ""))*0.6 ,pyro_1,"") + if(pyro_2 > greatest(ifnull(pyro_1, ""),ifnull(pyro_2, ""))*0.6,pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' as `esol`, sum((if(pyro_1 > greatest(ifnull(pyro_1, ""),ifnull(pyro_2, ""))*0.6 ,pyro_1,"") + if(pyro_2 > greatest(ifnull(pyro_1, ""),ifnull(pyro_2, ""))*0.6,pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996 as `theoretical`, sum(generation)/(sum((if(pyro_1 > greatest(ifnull(pyro_1, ""),ifnull(pyro_2, ""))*0.6 ,pyro_1,"") + if(pyro_2 > greatest(ifnull(pyro_1, ""),ifnull(pyro_2, ""))*0.6,pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996) as `PR` from `pyro_site_' + id +'` p left join export_' + id +' e on p.datetime = e.date group by year(dateTime), month(dateTime) order by date desc;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

    app.get('/api/reports/incidents' , function(req,res) {
    connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, reported_by_company, category, planned, loss_of_generation, details, status, group_concat(comment) as comment, incident_report_number from incident_log left join incident_comment on id = log_id where status = 1 and end_time > now();', function(err,rows){
      if(err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/reports/incidentsAll' , function(req,res) {
    connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, reported_by_company, category, planned, loss_of_generation, details, status, group_concat(comment) as comment, incident_report_number from incident_log left join incident_comment on id = log_id group by id;', function(err,rows){
      if(err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/reports/incidentsSite/:id' , function(req,res) {
  var id = req.params.id;
    connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, reported_by_company, category, planned, loss_of_generation, details, status, comment, incident_report_number from incident_log where site = ' + id + ';', function(err,rows){
      if(err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/displaySite/allSiteDaily/', function(req,res){
    connection.query('select date, ps1, ps2, ps3, ps4, ps5, ps7, ps8, ps9, ps10, ps11 from dailySumExport where date > NOW() - INTERVAL 30 DAY order by date asc', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });


  app.get('/api/displaySite/allSiteDailyMWp/', function(req,res){
    connection.query('select date, ps1/6.3 as `ps1`, ps2/9.272 as `ps2`, ps3/4.9030 as `ps3`, ps4/11.3140 as `ps4`,ps5/32.8 as `ps5`, ps7/39.9780 as `ps7`, ps8/14.96 as `ps8`, ps9/9.52 as `ps9`, ps10/14.96 as `ps10`, ps11/7.48 as `ps11` from dailySumExport where date > NOW() - INTERVAL 30 DAY order by date asc;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/mySQL/sumExport/:id', function(req,res){
    var id = req.params.id;
    connection.query('insert into dailySumExport(date,PS' + id +') select date, sum(generation) from export_' + id +' where date > NOW() - INTERVAL 30 DAY group by date order by date asc on duplicate key update PS' + id +'=VALUES(PS' + id +');', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/displaySite/allReport/', function(req,res){
    var id = req.params.id;
    connection.query('select sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) / sum(t.PS1_T01 + t.PS1_T02 + t.PS1_T03 + t.PS1_T04 + t.PS1_T05) as `PS01_avail`, sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) / sum(t.PS2_T01 + t.PS2_T02 + t.PS2_T03 + t.PS2_T04 + t.PS2_T05 + t.PS2_T06 + t.PS2_T07) as `PS02_avail`, sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) / sum(t.PS3_T01 + t.PS3_T02 + t.PS3_T03 + t.PS3_T04) as `PS03_avail`, sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) / sum(t.PS4_T01 + t.PS4_T02 + t.PS4_T03 + t.PS4_T04 + t.PS4_T05 + t.PS4_T06 + t.PS4_T07 + t.PS4_T08) as `PS04_avail`, sum(a.PS5) / sum(t.PS5) as `PS05_avail`, sum(a.PS7) / sum(t.PS7) as `PS07_avail`, sum(a.PS8) / sum(t.PS8) as `PS08_avail`, sum(a.PS9) / sum(t.PS9) as `PS09_avail`, sum(a.PS10) / sum(t.PS10) as `PS10_avail`, sum(a.PS11) / sum(t.PS11) as `PS11_avail`, sum(o.PS1_T01 + o.PS1_T02 + o.PS1_T03 + o.PS1_T04  + o.PS1_T05) / sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) as `PS01_Over0`, sum(o.PS2_T01 + o.PS2_T02 + o.PS2_T03 + o.PS2_T04 + o.PS2_T05 + o.PS2_T06 + o.PS2_T07) / sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) as `PS02_Over0`, sum(o.PS3_T01 + o.PS3_T02 + o.PS3_T03 + o.PS3_T04) / sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) as `PS03_Over0`, sum(o.PS4_T01 + o.PS4_T02 + o.PS4_T03 + o.PS4_T04 + o.PS4_T05 + o.PS4_T06 + o.PS4_T07 + o.PS4_T08) / sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) as `PS04_Over0`, sum(o.PS5) / sum(a.PS5) as `PS05_Over0`, sum(o.PS7) / sum(a.PS7) as `PS07_Over0`, sum(o.PS8) / sum(a.PS8) as `PS08_Over0`, sum(o.PS9) / sum(a.PS9) as `PS09_Over0`, sum(o.PS10) / sum(a.PS10) as `PS10_Over0`, sum(o.PS11) / sum(a.PS11) as `PS11_Over0`, sum(e.PS1) / sum(c.PS1 * (select tic_mwp from top_table where id = 1) * 1000) as `PS01_PR`, sum(e.PS2) / sum(c.PS2 * (select tic_mwp from top_table where id = 2) * 1000) as `PS02_PR`, sum(e.PS3) / sum(c.PS3 * (select tic_mwp from top_table where id = 3) * 1000) as `PS03_PR`, sum(e.PS4) / sum(c.PS4 * (select tic_mwp from top_table where id = 4) * 1000) as `PS04_PR`,sum(e.PS5) / sum(c.PS5 * (select tic_mwp from top_table where id = 5) * 1000) as `PS05_PR`,sum(e.PS7) / sum(c.PS7 * (select tic_mwp from top_table where id = 7) * 1000) as `PS07_PR`, sum(e.PS8) / sum(c.PS8 * (select tic_mwp from top_table where id = 8) * 1000) as `PS08_PR`, sum(e.PS9) / sum(c.PS9 * (select tic_mwp from top_table where id = 9) * 1000) as `PS09_PR`, sum(e.PS10) / sum(c.PS10 * (select tic_mwp from top_table where id = 10) * 1000) as `PS10_PR`, sum(e.PS11) / sum(c.PS11 * (select tic_mwp from top_table where id = 11) * 1000) as `PS11_PR`, sum(e.PS1) as `PS01_export`, sum(e.PS2) as `PS02_export`, sum(e.PS3) as `PS03_export`, sum(e.PS4) as `PS04_export`, sum(e.PS5) as `PS05_export`, sum(e.PS7) as `PS07_export`, sum(e.PS8) as `PS08_export`, sum(e.PS9) as `PS09_export`, sum(e.PS10) as `PS10_export`, sum(e.PS11) as `PS11_export` from dailySumExport e left join dailySumInverterOver0 o on e.date = o.date left join dailySumInverterAvailabilty a on e.date = a.date left join dailySumInverterTimeDiff t on e.date = t.date left join dailyEsol c on e.date = c.date where e.date <= (now() - interval 1 day) and e.date >= (now() - interval 8 day);', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/displaySite/reportSelect/:year/:month/:day/:numberOfDays', function(req,res){
    var year = req.params.year;
    var month = req.params.month;
    var day = req.params.day;
    var numberOfDays = req.params.numberOfDays;
    connection.query('select sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) / sum(t.PS1_T01 + t.PS1_T02 + t.PS1_T03 + t.PS1_T04 + t.PS1_T05) as `PS01_avail`, sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) / sum(t.PS2_T01 + t.PS2_T02 + t.PS2_T03 + t.PS2_T04 + t.PS2_T05 + t.PS2_T06 + t.PS2_T07) as `PS02_avail`, sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) / sum(t.PS3_T01 + t.PS3_T02 + t.PS3_T03 + t.PS3_T04) as `PS03_avail`, sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) / sum(t.PS4_T01 + t.PS4_T02 + t.PS4_T03 + t.PS4_T04 + t.PS4_T05 + t.PS4_T06 + t.PS4_T07 + t.PS4_T08) as `PS04_avail`, sum(a.PS5) / sum(t.PS5) as `PS05_avail`, sum(a.PS7) / sum(t.PS7) as `PS07_avail`, sum(a.PS8) / sum(t.PS8) as `PS08_avail`, sum(a.PS9) / sum(t.PS9) as `PS09_avail`, sum(a.PS10) / sum(t.PS10) as `PS10_avail`, sum(a.PS11) / sum(t.PS11) as `PS11_avail`, sum(o.PS1_T01 + o.PS1_T02 + o.PS1_T03 + o.PS1_T04  + o.PS1_T05) / sum(a.PS1_T01 + a.PS1_T02 + a.PS1_T03 + a.PS1_T04 + a.PS1_T05) as `PS01_Over0`, sum(o.PS2_T01 + o.PS2_T02 + o.PS2_T03 + o.PS2_T04 + o.PS2_T05 + o.PS2_T06 + o.PS2_T07) / sum(a.PS2_T01 + a.PS2_T02 + a.PS2_T03 + a.PS2_T04 + a.PS2_T05 + a.PS2_T06 + a.PS2_T07) as `PS02_Over0`, sum(o.PS3_T01 + o.PS3_T02 + o.PS3_T03 + o.PS3_T04) / sum(a.PS3_T01 + a.PS3_T02 + a.PS3_T03 + a.PS3_T04) as `PS03_Over0`, sum(o.PS4_T01 + o.PS4_T02 + o.PS4_T03 + o.PS4_T04 + o.PS4_T05 + o.PS4_T06 + o.PS4_T07 + o.PS4_T08) / sum(a.PS4_T01 + a.PS4_T02 + a.PS4_T03 + a.PS4_T04 + a.PS4_T05 + a.PS4_T06 + a.PS4_T07 + a.PS4_T08) as `PS04_Over0`, sum(o.PS5) / sum(a.PS5) as `PS05_Over0`, sum(o.PS7) / sum(a.PS7) as `PS07_Over0`, sum(o.PS8) / sum(a.PS8) as `PS08_Over0`, sum(o.PS9) / sum(a.PS9) as `PS09_Over0`, sum(o.PS10) / sum(a.PS10) as `PS10_Over0`, sum(o.PS11) / sum(a.PS11) as `PS11_Over0`, sum(e.PS1) / sum(c.PS1 * (select tic_mwp from top_table where id = 1) * 1000) as `PS01_PR`, sum(e.PS2) / sum(c.PS2 * (select tic_mwp from top_table where id = 2) * 1000) as `PS02_PR`, sum(e.PS3) / sum(c.PS3 * (select tic_mwp from top_table where id = 3) * 1000) as `PS03_PR`, sum(e.PS4) / sum(c.PS4 * (select tic_mwp from top_table where id = 4) * 1000) as `PS04_PR`,sum(e.PS5) / sum(c.PS5 * (select tic_mwp from top_table where id = 5) * 1000) as `PS05_PR`,sum(e.PS7) / sum(c.PS7 * (select tic_mwp from top_table where id = 7) * 1000) as `PS07_PR`, sum(e.PS8) / sum(c.PS8 * (select tic_mwp from top_table where id = 8) * 1000) as `PS08_PR`, sum(e.PS9) / sum(c.PS9 * (select tic_mwp from top_table where id = 9) * 1000) as `PS09_PR`, sum(e.PS10) / sum(c.PS10 * (select tic_mwp from top_table where id = 10) * 1000) as `PS10_PR`, sum(e.PS11) / sum(c.PS11 * (select tic_mwp from top_table where id = 11) * 1000) as `PS11_PR`, sum(e.PS1) as `PS01_export`, sum(e.PS2) as `PS02_export`, sum(e.PS3) as `PS03_export`, sum(e.PS4) as `PS04_export`, sum(e.PS5) as `PS05_export`, sum(e.PS7) as `PS07_export`, sum(e.PS8) as `PS08_export`, sum(e.PS9) as `PS09_export`, sum(e.PS10) as `PS10_export`, sum(e.PS11) as `PS11_export` from dailySumExport e left join dailySumInverterOver0 o on e.date = o.date left join dailySumInverterAvailabilty a on e.date = a.date left join dailySumInverterTimeDiff t on e.date = t.date left join dailyEsol c on e.date = c.date where e.date < "' + year + '-' + month + '-' + day + '" and e.date >= ("' + year + '-' + month + '-' + day + '" - interval ' + numberOfDays + ' day);', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/incidents/incidentSiteName/', function(req,res){
    connection.query('select id, name from top_table;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

  app.get('/api/incidents/incidentCategory/', function(req,res){
    connection.query('select id, value from incident_report_category;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

};
