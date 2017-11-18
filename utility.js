var fs = require('fs');
var file = "./logs/log.txt";

module.exports =
{
  parseDateString: function()
  {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return  h + ":" + m + ":" + s;
  },

  writeLogFile: function(str)
  {
    if(!str) return;

    fs.appendFile(file, str + "\n", function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("saved logfile");
    });
  }
};
