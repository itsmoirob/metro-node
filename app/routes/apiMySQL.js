module.exports = function(app,connection,csvParse,fs,moment) {

  app.get('/api/mySQL/export/test', function(req, res) { //this is only a test line

    var filePath = "./local.csv";

    fs.readFile(filePath, {
      encoding: 'utf-8'
    }, function(err, csvData) {
      if (err) {
        console.log(err);
      }
      csvParse(csvData, {
        delimiter: ','
      }, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          var sqlInputData = [];
          var n = 0;
          var day = moment(data[0][1], "DD/MM/YYYY").format("YYYY-MM-DD");
          var hour = data[0][1];
          for (i = 2; i < data[0].length; i=i+2) {
            sqlInputData[n] = ["('" + day + "','" + moment(hour, "DD/MM/YYYY").format("HH:mm:ss") + "'," + data[0][i]+")"];
            hour = moment(hour,"DD/MM/YYYY").add(30,'minutes');
            n++;
          }
          connection.query("INSERT INTO test VALUES " + sqlInputData, function(err, result){
            if (err) throw err;
            console.log(result.insertId);
          });
        }
      });
    });
  });
};
