//--------------------------------------------------
// Squirrel af.hernandezl
//--------------------------------------------------
let tEvents = document.getElementById("tableEvents");
let tCorrelation = document.getElementById("tableCorrelation");

let loadData = new Promise((resolve, reject) => {
  let req = new XMLHttpRequest();
  req.open(
    "GET",
    "https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json"
  );
  req.onload = function () {
    if (req.status == 200) {
      resolve(this.response);
    } else reject("error");
  };
  req.send();
});

function calculateMCC(TN, FN, FP, TP) {
  let up = TP * TN - FP * FN;
  let down = (TP + FP) * (TP + FN) * (TN + FP) * (TN + FN);
  return up / Math.sqrt(down);
}

loadData.then((eventsJson) => {
  squirrelData = JSON.parse(eventsJson);
  let keys = [];
  let events = [];
  let countSquirrel = 0;
  let countNSquirrel = 0;

  //----------------------
  // Correlation Table
  //----------------------
  let tEventsBody = document.createElement("tbody");
  for (let i = 0; i < squirrelData.length; i++) {
    let rowData = squirrelData[i];
    let row = document.createElement("tr");

    if (rowData.squirrel === true) {
      row.className += "table-danger";
      countSquirrel++;
    } else countNSquirrel++;
    // ID
    let id = document.createElement("th");
    id.appendChild(document.createTextNode("" + (i + 1)));
    row.appendChild(id);

    //Events
    let eventsCell = document.createElement("td");
    let txt = "";
    let eventsTemp = rowData.events;
    eventsTemp.forEach(function (event) {
      txt += event + ", ";
      if (!keys.includes(event)) {
        keys.push(event);
        events.push({ name: event, TP: 0, FN: 0 });
      }
      let key = keys.indexOf(event);
      if (rowData.squirrel) events[key].TP++;
      else events[key].FN++;
    });
    txt = txt.substring(0, txt.length - 2);
    eventsCell.appendChild(document.createTextNode(txt));
    row.appendChild(eventsCell);

    //Squirrel
    let squirrel = document.createElement("td");
    squirrel.appendChild(document.createTextNode("" + rowData.squirrel));
    row.appendChild(squirrel);

    tEventsBody.appendChild(row);
  }
  tEvents.appendChild(tEventsBody);

  //----------------------
  // Correlation Table
  //----------------------
  let tCorrelationBody = document.createElement("tbody");

  events.forEach(function (event) {
    event.TN = countNSquirrel - event.FN - event.TP;
    event.FP = countSquirrel - event.TP;
    event.MCC = 0 + calculateMCC(event.TN, event.FN, event.FP, event.TP);
  });
  events = events.sort(function (a, b) {
    if (a.MCC < b.MCC) return 1;
    if (a.MCC > b.MCC) return -1;
    return 0;
  });
  for (let i = 0; i < events.length; i++) {
    let event = events[i];
    let row = document.createElement("tr");
    // ID
    let id = document.createElement("th");
    id.appendChild(document.createTextNode("" + (i + 1)));
    row.appendChild(id);

    // Event name
    let name = document.createElement("td");
    name.appendChild(document.createTextNode("" + event.name));
    row.appendChild(name);

    // Correlation
    let correlation = document.createElement("td");
    correlation.appendChild(document.createTextNode("" + event.MCC));
    row.appendChild(correlation);

    tCorrelationBody.appendChild(row);
  }

  tCorrelation.appendChild(tCorrelationBody);
});
