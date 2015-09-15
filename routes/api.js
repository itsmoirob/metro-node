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
    connection.query('SELECT UNIX_TIMESTAMP(cast(`date` as datetime) + cast(`time` as time))*1000 as `timeU`, `generation` from  `export_' + id +'`;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
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
    connection.query('select e.date, sum(generation) as `export`, if(a.pyro_1 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_1,"") as `mod 1`, if(a.pyro_2 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_2,"") as `mod 2`, (if(a.pyro_1 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_1,"") + if(a.pyro_2 > greatest(ifnull(a.pyro_1, ""),ifnull(a.pyro_2, ""))*0.6,a.pyro_2,"")) / (ifnull(((select `mod 1`) <> ""), 0) + ifnull(((select `mod 2`) <> ""), 0)) as `pyroMean`, SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5 as `opHours`, (select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000 as `esol`, ((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') * 1 * 0.996 as `theoretical`, format(sum(generation) / (((select `pyroMean`) * (SUM(CASE WHEN e.generation > 0 THEN 1 ELSE 0 END) * 0.5) / 1000) * (select tic_mwp * 1000 from top_table where id = ' + id +') * 1 * 0.996),2,"%") as `PR` from `export_' + id +'` e left join `avg_day_pyro_site_10` a on e.date = a.date group by date order by date desc;', function(err,rows){
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });



  // api for getting generation of all sites
  app.get('/api/testLoop', function(req,res){

    return res.json("World");
  });

};
