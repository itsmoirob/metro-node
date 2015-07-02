module.exports = function(app,connection,csvParse,fs,moment,async,pool,Ftp) {
  var mpanList = [{"id":1,"mpan":"2100041172109_180615_Historical"},{"id":2,"mpan":"2000055901355_180615_Historical"},{"id":3,"mpan":"2000055901300_180615_Historical"},{"id":4,"mpan":"1050000588215_180615_Historical"},{"id":5,"mpan":"2200042384200_180615_Historical"},{"id":null,"mpan":null},{"id":7,"mpan":"2000056147387_180615_Historical"},{"id":8,"mpan":"1900091171276"},{"id":9,"mpan":"1900091178963"},{"id":10,"mpan":"1900091183411"},{"id":11,"mpan":"2200042480656"}];

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


  app.get('/api/mySQL/exportUpload/:id', function(req, res) { //this is only a test line
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
          var hour = data[0][1];
          for (j=0;j<data.length;j++){ // use this line only for histroical data
            var day = moment(data[j][1], "DD/MM/YYYY").format("YYYY-MM-DD");
            for (i = 2; i < data[0].length; i=i+2) {
              sqlInputData[n] = ["('" + day + "','" + moment(hour, "DD/MM/YYYY").format("HH:mm:ss") + "'," + data[j][i]+")"];
              hour = moment(hour,"DD/MM/YYYY").add(30,'minutes');
              n++;
            }
          }
          // res.send("INSERT INTO export_"+mpanList[id].id+" VALUES "+sqlInputData);
          connection.query("INSERT INTO export_"+mpanList[id].id+" VALUES "+sqlInputData, function(err, result){
            if (err) throw err;
            console.log(result.insertId);
            res.send("Done: INSERT INTO test VALUES " + sqlInputData);
          });
        }
      });
    });
  });
};
