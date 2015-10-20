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
    connection.query('select date(dateTime) as `date`, sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' as `esol`, sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996 as `theoretical`, sum(generation) as `generation`, sum(generation)/(sum((ifnull(pyro_1,"") + ifnull(pyro_2,"")) / ((CASE WHEN pyro_1 is null THEN 0 ELSE 1 END) + (CASE WHEN pyro_2 is null THEN 0 ELSE 1 END)))/' + minutes +' * (select tic_mwp * 1000 from top_table where id = ' + id +') * 0.996) as `PR` from `pyro_site_' + id +'` p left join export_' + id +' e on p.datetime = e.date group by year(dateTime), month(dateTime) order by date desc;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
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

  // get export generation for met office test
  app.get('/api/mySQL/pyroMeanInsert/:id', function(req,res){
    var id = req.params.id;
    if (id == 5) {
      connection.query('insert into avg_day_pyro_site_' + id + ' SELECT date(dateTime), if(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),""))/(3) * (1-.3173) and (ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),""))/(3) * (1+.3173),sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_1`, if(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),""))/(3) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),""))/(3) * (1+.3173),sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_2`, if(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),""))/(3) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),""))/(3) * (1+.3173),sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_3`, if(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),""))/(3) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),""))/(3) * (1+.3173),sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_4` from pyro_site_' + id + ' group by date(dateTime) ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2),pyro_3=VALUES(pyro_3),pyro_4=VALUES(pyro_4);', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else if (id == 11) {
      connection.query('insert into avg_day_pyro_site_' + id + ' SELECT date(dateTime), if(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),""))/((pyro_2 is not null) + (pyro_3 is not null)) * (1-.3173) and (ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),""))/((pyro_2 is not null) + (pyro_3 is not null)) * (1+.3173),sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_1`, if(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),""))/((pyro_1 is not null) + (pyro_3 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),""))/((pyro_1 is not null) + (pyro_3 is not null)) * (1+.3173),sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_2`, if(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),""))/((pyro_1 is not null) + (pyro_2 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),""))/((pyro_1 is not null) + (pyro_2 is not null)) * (1+.3173),sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_3` from pyro_site_' + id + ' group by date(dateTime)  ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2),pyro_3=VALUES(pyro_3);', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else if (id == 7) {
      connection.query('insert into avg_day_pyro_site_' + id + ' SELECT date(dateTime),if(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_1`, if(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_2`, if(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_3`, if(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_4`, if(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_5`, if(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_6`, if(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_7`, if(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_8`, if(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_10 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_9`, if(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_11 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_10`, if(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_12 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_12 is not null)) * (1+.3173),sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_11`, if(sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END)>= (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null)) * (1-.3173) and (ifnull(sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_3)/SUM(CASE WHEN pyro_3 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_4)/SUM(CASE WHEN pyro_4 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_5)/SUM(CASE WHEN pyro_5 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_6)/SUM(CASE WHEN pyro_6 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_7)/SUM(CASE WHEN pyro_7 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_8)/SUM(CASE WHEN pyro_8 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_9)/SUM(CASE WHEN pyro_9 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_10)/SUM(CASE WHEN pyro_10 > 0 THEN 1 ELSE 0 END),"") + ifnull(sum(pyro_11)/SUM(CASE WHEN pyro_11 > 0 THEN 1 ELSE 0 END),"") )/((pyro_1 is not null) + (pyro_2 is not null) + (pyro_3 is not null) + (pyro_4 is not null) + (pyro_5 is not null) + (pyro_6 is not null) + (pyro_7 is not null) + (pyro_8 is not null) + (pyro_9 is not null) + (pyro_10 is not null) + (pyro_11 is not null)) * (1+.3173),sum(pyro_12)/SUM(CASE WHEN pyro_12 > 0 THEN 1 ELSE 0 END),"") as `mod_pyro_12` from pyro_site_' + id + ' group by date(dateTime)  ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2),pyro_3=VALUES(pyro_3),pyro_4=VALUES(pyro_4),pyro_5=VALUES(pyro_5),pyro_6=VALUES(pyro_6),pyro_7=VALUES(pyro_7), pyro_8=VALUES(pyro_8),pyro_9=VALUES(pyro_9),pyro_10=VALUES(pyro_10),pyro_11=VALUES(pyro_11),pyro_12=VALUES(pyro_12);', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    } else {
      connection.query('insert into avg_day_pyro_site_' + id +' SELECT date(dateTime), sum(pyro_1)/SUM(CASE WHEN pyro_1 > 0 THEN 1 ELSE 0 END), sum(pyro_2)/SUM(CASE WHEN pyro_2 > 0 THEN 1 ELSE 0 END) from pyro_site_' + id +' group by date(dateTime) ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2);', function(err,rows){
        if (err){
          return res.json(err);
        } else {
          return res.json(rows);
        }
      });
    }
  });

  app.get('/api/reports/incidents' , function(req,res) {
    connection.query('select id, site, date_logged, start_time, end_time, reported_by_person, reported_by_company, category, planned, loss_of_generation, details, status, comment, incident_report_number from incident_log where status = 1;', function(err,rows){
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

};
