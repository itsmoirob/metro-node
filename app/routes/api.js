module.exports = function(app,connection) {

  app.get('/api/test', function(req, res) { //this is only a test line
    res.send([{name:'yes'}, {name:'its'}, {name:'working'}]);
  });

  app.get('/api/pickUp', function(req,res){
    connection.query('SELECT id, name, tic_mwp from top_table', function(err, rows) {
      if (err){
        return res.json(err);
      } else {
        return res.json(rows);
      }
    });
  });

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

  //
  // app.get('/api/displaySite/generation/:id', function(req,res){
  //   var id = req.params.id;
  //   connection.query('SELECT UNIX_TIMESTAMP(cast(`date` AS datetime) + cast(`time` as time))*1000 as `timeU`, `generation`, `inverter_number` from `inverter_site_generation_' + id + '` where inverter_number < 5 AND generation > 0 order by `inverter_number`, `timeU` ;',  function(err, rows) {
  //     if (err) {
  //       console.err('problem in query =', err.description);
  //       process.exit(1);
  //     }
  //
  //     var results = {
  //       id : [],
  //       data : []
  //     };
  //
  //     res.forEach(function (row) {
  //       results.id.push(row.inverter_number);
  //       results.data.push(row.timeU);
  //     });
  //
  //     // Do something with the value here
  //     var returnValue = JSON.stringify(results);
  //   });
  // });


  //
  //
  //
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
  //
  //




};
