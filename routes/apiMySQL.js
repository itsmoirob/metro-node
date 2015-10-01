module.exports = function(app,connection,csvParse,fs,moment,pool,Ftp) {
  var mpanList = [{"id":1,"mpan":"2100041172109"},{"id":2,"mpan":"2000055901355"},{"id":3,"mpan":"2000055901300"},{"id":4,"mpan":"1050000588215"},{"id":5,"mpan":"2200042384200"},{"id":null,"mpan":null},{"id":7,"mpan":"2000056147387"},{"id":8,"mpan":"1900091171276"},{"id":9,"mpan":"1900091178963"},{"id":10,"mpan":"1900091183411"},{"id":11,"mpan":"2200042480656"}];

  app.get('/api/ftp/:id' ,function(req,res) {
    var id = req.params.id-1;

    Ftp.get(mpanList[id].mpan+".csv", mpanList[id].mpan+".csv", function(hadErr) {
      if (hadErr)
      console.error('There was an error retrieving the file.'+hadErr);
      else
      console.log('File copied successfully!');
      res.send("File "+mpanList[id].mpan+".csv has been downloaded");
    });
  });


  app.get('/api/mySQL/exportUpload/:id', function(req, res) {
    var id = req.params.id-1;
    var filePath = "./"+mpanList[id].mpan+".csv";
    fs.readFile(filePath, {
      encoding: 'utf-8'
    }, function(err, csvData) {
      if (err) {
        console.log(err);
      }
      csvParse(csvData, {
        separator: ',',
        newline: '\n'
      }, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          var sqlInputData = [];
          var n = 0;

          for (j=8;j<data.length;j++){ // use this line only for histroical data
            var day = moment(data[j][7], "DD/MM/YY").format("YYYY-MM-DD");
            for (i = 8; i < data[j].length; i++) {
              var hour = data[7][i];
              if (data[j][i] === "-"){
                data[j][i] = "NULL";
              }
              sqlInputData[n] = ["(NULL, '" + day + "','" + hour + "'," + data[j][i]+")"];
              // hour = moment(hour,"DD/MM/YYYY").add(30,'minutes');
              n++;
            }
          }
          // res.send("INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData + "  ON DUPLICATE KEY UPDATE generation=VALUES(generation)");
          connection.query("INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData + "  ON DUPLICATE KEY UPDATE generation=VALUES(generation)", function(err, result){
            if (err) throw err;
            console.log(result.insertId);
            res.send("Done: INSERT INTO export_" + mpanList[id].id + " VALUES " + sqlInputData);
          });
        }
      });
    });
  });


  // upload pyro data.
  app.get('/api/mySQL/pyroUpload/:id', function(req,res){
    var id = req.params.id;
    var filePath = "./PS" + id + " Pyro.csv";

    fs.readFile(filePath, {
      encoding: 'utf-8'
    }, function(err, csvData) {
      if (err) {
        console.log(err);
      }
      csvParse(csvData, {
        separator: ',',
        newline: '\n'
      }, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          var sqlInputData = [];
          var n = 0;
          if (id < 5) {
            for (j=1;j<data.length;j++){ // if site is 1 to 4
              // data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm"); // if required uncomment out this line
              data[j][1] = parseFloat(data[j][1]);
              data[j][2] = parseFloat(data[j][2]);
              if (isNaN(data[j][1])) {
                data[j][1] = "NULL";
              }
              if (data[j][1] < 0) {
                data[j][1] = 0;
              }
              if (isNaN(data[j][2])) {
                data[j][2] = "NULL";
              }
              if (data[j][2] < 0) {
                data[j][2] = 0;
              }
              sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + ")"];
              n++;
            }
            // res.send("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2)");
            connection.query("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2)", function(err, result){
              if (err) throw err;
              console.log(result.insertId);
              res.send("Done: INSERT INTO pyro_site VALUES " + sqlInputData);
            });
          } else if (id == 5) {
            for (j=1;j<data.length;j++){
              data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
              data[j][1] = parseFloat(data[j][1]);
              data[j][2] = parseFloat(data[j][2]);
              data[j][3] = parseFloat(data[j][3]);
              data[j][4] = parseFloat(data[j][4]);
              if (isNaN(data[j][1])) {
                data[j][1] = "NULL";
              }
              if (data[j][1] < 0) {
                data[j][1] = 0;
              }
              if (isNaN(data[j][2])) {
                data[j][2] = "NULL";
              }
              if (data[j][2] < 0) {
                data[j][2] = 0;
              }
              if (isNaN(data[j][3])) {
                data[j][3] = "NULL";
              }
              if (data[j][3] < 0) {
                data[j][3] = 0;
              }
              if (isNaN(data[j][4])) {
                data[j][4] = "NULL";
              }
              if (data[j][4] < 0) {
                data[j][4] = 0;
              }
              sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + "," + data[j][3] + "," + data[j][4] + ")"];
              n++;
            }
            // res.send("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_2=VALUES(pyro_3), pyro_2=VALUES(pyro_4)");
            connection.query("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3), pyro_4=VALUES(pyro_4)", function(err, result){
              if (err) throw err;
              console.log(result.insertId);
              res.send("Done: INSERT INTO pyro_site VALUES " + sqlInputData);
            });
          } else if (id == 7) {

            for (j=1;j<data.length;j++){
              data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");

              data[j][1] = parseFloat(data[j][1]);
              data[j][2] = parseFloat(data[j][2]);
              data[j][3] = parseFloat(data[j][3]);
              data[j][4] = parseFloat(data[j][4]);
              data[j][5] = parseFloat(data[j][5]);
              data[j][6] = parseFloat(data[j][6]);
              data[j][7] = parseFloat(data[j][7]);
              data[j][8] = parseFloat(data[j][8]);
              data[j][9] = parseFloat(data[j][9]);
              data[j][10] = parseFloat(data[j][10]);
              data[j][11] = parseFloat(data[j][11]);
              data[j][12] = parseFloat(data[j][12]);

              if (isNaN(data[j][1])) {
                data[j][1] = "NULL";
              }
              if (data[j][1] < 0.1) {
                data[j][1] = 0;
              }
              if (isNaN(data[j][2])) {
                data[j][2] = "NULL";
              }
              if (data[j][2] < 0.1) {
                data[j][2] = 0;
              }
              if (isNaN(data[j][3])) {
                data[j][3] = "NULL";
              }
              if (data[j][3] < 0.1) {
                data[j][3] = 0;
              }
              if (isNaN(data[j][4])) {
                data[j][4] = "NULL";
              }
              if (data[j][4] < 0.1) {
                data[j][4] = 0;
              }
              if (isNaN(data[j][5])) {
                data[j][5] = "NULL";
              }
              if (data[j][5] < 0.1) {
                data[j][5] = 0;
              }
              if (isNaN(data[j][6])) {
                data[j][6] = "NULL";
              }
              if (data[j][6] < 0.1) {
                data[j][6] = 0;
              }
              if (isNaN(data[j][7])) {
                data[j][7] = "NULL";
              }
              if (data[j][7] < 0.1) {
                data[j][7] = 0;
              }
              if (isNaN(data[j][8])) {
                data[j][8] = "NULL";
              }
              if (data[j][8] < 0.1) {
                data[j][8] = 0;
              }
              if (isNaN(data[j][9])) {
                data[j][9] = "NULL";
              }
              if (data[j][9] < 0.1) {
                data[j][9] = 0;
              }
              if (isNaN(data[j][10])) {
                data[j][10] = "NULL";
              }
              if (data[j][10] < 0.1) {
                data[j][10] = 0;
              }
              if (isNaN(data[j][11])) {
                data[j][11] = "NULL";
              }
              if (data[j][11] < 0.1) {
                data[j][11] = 0;
              }
              if (isNaN(data[j][12])) {
                data[j][12] = "NULL";
              }
              if (data[j][12] < 0.1) {
                data[j][12] = 0;
              }
              sqlInputData.push("('" + data[j][0] + "'");
              sqlInputData.push(data[j][1]);
              sqlInputData.push(data[j][2]);
              sqlInputData.push(data[j][3]);
              sqlInputData.push(data[j][4]);
              sqlInputData.push(data[j][5]);
              sqlInputData.push(data[j][6]);
              sqlInputData.push(data[j][7]);
              sqlInputData.push(data[j][8]);
              sqlInputData.push(data[j][9]);
              sqlInputData.push(data[j][10]);
              sqlInputData.push(data[j][11]);
              sqlInputData.push(data[j][12]+")");
              n++;
            }
            // res.send("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3), pyro_4=VALUES(pyro_4), pyro_5=VALUES(pyro_5), pyro_6=VALUES(pyro_6), pyro_7=VALUES(pyro_7), pyro_8=VALUES(pyro_8), pyro_9=VALUES(pyro_9), pyro_10=VALUES(pyro_10), pyro_11=VALUES(pyro_11), pyro_11=VALUES(pyro_11), pyro_12=VALUES(pyro_12)");
            connection.query("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3), pyro_4=VALUES(pyro_4), pyro_5=VALUES(pyro_5), pyro_6=VALUES(pyro_6), pyro_7=VALUES(pyro_7), pyro_8=VALUES(pyro_8), pyro_9=VALUES(pyro_9), pyro_10=VALUES(pyro_10), pyro_11=VALUES(pyro_11), pyro_11=VALUES(pyro_11), pyro_12=VALUES(pyro_12)", function(err, result){
              if (err) throw err;
              console.log(result.insertId);
              res.send("Done: INSERT INTO pyro_site" + id + " VALUES " + sqlInputData);
            });

          } else if (id > 7 && id < 11) {

            for (j=2;j<data.length;j++){ // if site is 7 to 11
              data[j][0] = moment(data[j][0], "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm"); // if required uncomment out this line
              data[j][1] = parseFloat(data[j][1]);
              data[j][2] = parseFloat(data[j][2]);
              if (isNaN(data[j][1])) {
                data[j][1] = "NULL";
              }
              if (data[j][1] < 0.1) {
                data[j][1] = 0;
              }
              if (isNaN(data[j][2])) {
                data[j][2] = "NULL";
              }
              if (data[j][2] < 0.1) {
                data[j][2] = 0;
              }
              sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + ")"];
              n++;
            }
            // res.send("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2)");
            connection.query("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2)", function(err, result){
              if (err) throw err;
              console.log(result.insertId);
              res.send("Done: INSERT INTO pyro_site VALUES " + sqlInputData);
            });

          } else if (id == 11) {

            for (j=2;j<data.length;j++){ // if site is 11
              data[j][0] = moment(data[j][0], "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm"); // if required uncomment out this line
              data[j][1] = parseFloat(data[j][1]);
              data[j][2] = parseFloat(data[j][2]);
              data[j][3] = parseFloat(data[j][3]);
              if (isNaN(data[j][1])) {
                data[j][1] = "NULL";
              }
              if (data[j][1] < 0.1) {
                data[j][1] = 0;
              }
              if (isNaN(data[j][2])) {
                data[j][2] = "NULL";
              }
              if (data[j][2] < 0.1) {
                data[j][2] = 0;
              }
              if (isNaN(data[j][3])) {
                data[j][3] = "NULL";
              }
              if (data[j][3] < 0.1) {
                data[j][3] = 0;
              }
              sqlInputData[n] = ["('" + data[j][0] + "'," + data[j][1] + "," + data[j][2] + "," + data[j][3] + ")"];
              n++;
            }
            // res.send("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3)");
            connection.query("INSERT INTO pyro_site_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE pyro_1=VALUES(pyro_1), pyro_2=VALUES(pyro_2), pyro_3=VALUES(pyro_3)", function(err, result){
              if (err) throw err;
              console.log(result.insertId);
              res.send("Done: INSERT INTO pyro_site VALUES " + sqlInputData);
            });

          } else {
            res.send("Hello last else "+id);
          }
        }
      });
    });
  });

  // upload pyro data.
  app.get('/api/mySQL/invUpload/:id', function(req,res){
    var id = req.params.id;
    var filePath = "./PS" + id + " Inv.csv";

    fs.readFile(filePath, {
      encoding: 'utf-8'
    }, function(err, csvData) {
      if (err) {
        console.log(err);
      }
      csvParse(csvData, {
        separator: ',',
        newline: '\n'
      }, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          var sqlInputData = [];
          // var n = 1;
          if(id >= 8 && id <= 10)
          {
            for (j=2;j<data.length;j++){
              for (i=1;i<2;i++){
                data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
                data[j][i] = parseFloat(data[j][i]);
                if (isNaN(data[j][i])) {
                  data[j][i] = "NULL";
                }
                if (data[j][i] < 0.6) {
                  data[j][i] = 0;
                }
                sqlInputData.push("('" + data[j][0] + "'");
                for (k=1;k<=data[j].length-1;k++){
                  if(k==data[j].length-1){
                    sqlInputData.push(k + "," + data[j][k] + ")");
                  } else {
                    sqlInputData.push(k + "," + data[j][k] + "),('" + data[j][0] + "'");
                  }
                }
                // n++;
              }
            }
            // res.send("INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation);");
            connection.query("INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation);", function(err, result){
              if (err) throw err;
              console.log(result.insertId);
              res.send("Done: INSERT INTO inverter_generation_" + id + sqlInputData);
            });
          } else {

          for (j=1;j<data.length;j++){
            for (i=1;i<2;i++){
              data[j][0] = moment(data[j][0], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
              data[j][i] = parseFloat(data[j][i]);
              if (isNaN(data[j][i])) {
                data[j][i] = "NULL";
              }
              if (data[j][i] < 0.6) {
                data[j][i] = 0;
              }
              sqlInputData.push("('" + data[j][0] + "'");
              for (k=1;k<=data[j].length-1;k++){
                if(k==data[j].length-1){
                  sqlInputData.push("17," + data[j][k] + ")");
                } else {
                  sqlInputData.push("17," + data[j][k]);
                }
              }
              n++;
            }
          }
          res.send("INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation);");
          // connection.query("INSERT INTO inverter_generation_" + id + " VALUES " + sqlInputData + " ON DUPLICATE KEY UPDATE generation=VALUES(generation);", function(err, result){
          //   if (err) throw err;
          //   console.log(result.insertId);
          //   res.send("Done: INSERT INTO inverter_generation_" + id + sqlInputData);
          // });
          }
        }
      });
    });
  });


};
