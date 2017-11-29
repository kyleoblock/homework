const fs = require('fs');
var plansArray = [];
var zipsArray = [];
var slcspArray = [];

importPlans();
importZips();
importSLCSP();
processData();
exportCSV();

function importPlans() {
  var plansLines = fs.readFileSync("plans.csv", "utf8");
  plansLines = plansLines.split(/\r\n|\n/);
  for(var i = 1; i < plansLines.length; i++) {
    var data = plansLines[i].split(',');
    var tempPlanArray = [];
    for(var j = 0; j < data.length; j++) {
      tempPlanArray.push(data[j]);
    }
    plansArray.push(new Plans(tempPlanArray[0], tempPlanArray[1], tempPlanArray[2], tempPlanArray[3], tempPlanArray[4]));
  }
}

function importZips() {
  var zipsLines = fs.readFileSync("zips.csv", "utf8");
  zipsLines = zipsLines.split(/\r\n|\n/);
  for(var i = 1; i < zipsLines.length; i++) {
    var data = zipsLines[i].split(',');
    var tempZipsArray = [];
    for(var j = 0; j < data.length; j++) {
      tempZipsArray.push(data[j]);
    }
    zipsArray.push(new Zips(tempZipsArray[0], tempZipsArray[1], tempZipsArray[2], tempZipsArray[3], tempZipsArray[4]));
  }
}

function importSLCSP() {
  var slcspLines = fs.readFileSync("slcsp.csv", "utf8");
  slcspLines = slcspLines.split(/\r\n|\n/);
  for(var i = 1; i < slcspLines.length; i++) {
    var data = slcspLines[i].split(',');
    var tempSLCSPArray = [];
    for(var j = 0; j < data.length; j++) {
      tempSLCSPArray.push(data[j]);
    }
    slcspArray.push(new SLCSP(tempSLCSPArray[0], tempSLCSPArray[1]));
  }
}

function processData() {
  for(var i = 0; i < slcspArray.length; i++) {
    for(var j = 0; j < zipsArray.length; j++) {
      if(zipsArray[j].zipcode == slcspArray[i].zipcode && slcspArray[i].rate_area === "") {
        var newZip = zipsArray[j];
        slcspArray[i].rate_area = zipsArray[j].rate_area;
        slcspArray[i].rate = findRates(newZip);
      } else if(zipsArray[j].zipcode == slcspArray[i].zipcode && slcspArray[i].rate_area != zipsArray[j].rate_area) {
        slcspArray[i].rate = "";
        j = zipsArray.length;
      }
    }
  }
}

function exportCSV() {
  var finalString = "zipcode,rate\n";
  for(var i = 0; i < slcspArray.length; i++) {
    finalString += slcspArray[i].zipcode + "," + slcspArray[i].rate + "\n";
  }
  fs.writeFile("slcsp_output.csv", finalString, (err) => {
    if(err) throw err;
  });
}

function findRates(newZip) {
  var validRates = [];
  for(var i = 0; i < plansArray.length; i++) {
    if(plansArray[i].rate_area == newZip.rate_area && plansArray[i].state == newZip.state && plansArray[i].metal_level == "Silver") {
      validRates.push(plansArray[i].rate);
    }
  }
  if(validRates === undefined || validRates.length == 0) {
    return "";
  }
  var uniqueRates = [...new Set(validRates)];
  uniqueRates.sort();
  return uniqueRates[1];
}

function Plans(plan_id, state, metal_level, rate, rate_area) {
  this.plan_id = plan_id;
  this.state = state;
  this.metal_level = metal_level;
  this.rate = rate;
  this.rate_area = rate_area;
}

function Zips(zipcode, state, county_code, name, rate_area) {
  this.zipcode = zipcode;
  this.state = state;
  this.county_code = county_code;
  this.name = name;
  this.rate_area = rate_area;
}

function SLCSP(zipcode, rate) {
  this.zipcode = zipcode;
  this.rate = rate;
  this.rate_area = "";
}
