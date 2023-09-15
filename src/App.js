import { useState } from "react";
import Papa from "papaparse";
import moment from "moment";

import "./App.css";

const allowedExtensions = ["csv"];

const App = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState("");

  const handleFileChange = (e) => {
    setError("");

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }
      setFile(inputFile);
    }
  };

  const handleParse = () => {
    // If user clicks the parse button without
    // a file we show a error
    if (!file) return setError("Enter a valid file");

    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader();

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      setData(parsedData);
    };

    reader.readAsText(file);
  };

  let sorterByProjects = [];

  if (data.length > 0) {
    for (let i = 0; i < data.length - 1; i++) {
      const firstEmp = data[i];
      for (let j = i + 1; j < data.length; j++) {
        const SecondEmp = data[j];
        if (SecondEmp !== undefined && firstEmp.ProjectID === SecondEmp.ProjectID) {
          sorterByProjects.push({ firstEmp, SecondEmp });
        }
      }
    }
  }

  const resultArray = [];

  Object.values(sorterByProjects).map((pair) => {
    let firstStart = pair.firstEmp.DateFrom;
    let firstEnd = pair.firstEmp.DateTo;
    let secondStart = pair.SecondEmp.DateFrom;
    let secondEnd = pair.SecondEmp.DateTo;

    if (firstEnd.toLowerCase() === 'null') {
      firstEnd = moment().format('YYYY-MM-DD');
    }
    if (secondEnd.toLowerCase() === "null") {
      secondEnd = moment().format("YYYY-MM-DD");
    }

    firstStart = moment(firstStart);
    firstEnd = moment(firstEnd);
    secondStart = moment(secondStart);
    secondEnd = moment(secondEnd);

    // Determine the start of the overlap period.
    const overlapStart = moment.max(firstStart, secondStart);

    // Determine the end of the overlap period.
    const overlapEnd = moment.min(firstEnd, secondEnd);

    // Calculate the overlap in days.
    const overlapInDays = overlapEnd.diff(overlapStart, "days");

    if(overlapInDays > 0) {
      resultArray.push({
        EmpOne: pair.firstEmp.EmpID,
        EmpTwo: pair.SecondEmp.EmpID,
        ProjectID: pair.firstEmp.ProjectID,
        workedTogether: overlapInDays,
      });
    } 
    
    return null
  });

  ///////////////////// THE APP WORK WITH YYYY-MM-DD & MM-DD-YYYY Date Format Types //////////////////////

  /*-----sample data----
EmpID,ProjectID,DateFrom,DateTo
101,7,06-10-2011,2011-09-19
125,7,2011-05-05,08/27/2011
110,99,2011-06-10,2011-09-19
120,99,2011-04-09,2011-09-22
103,14,2011-07-20,NULL
106,14,2011-07-20,08/27/2011
106,13,2011-07-10,2012-01-01
184,2,2011-05-10,2011-08-10
111,2,2011-06-10,2011-06-12
137,6,2015-01-14,2015-02-20
188,6,2015-02-08,2015-03-03
127,11,2023-08-14,NULL
137,11,2023-07-14,NULL
137,1,2023-07-14,NULL
185,1,2015-10-08,2015-12-03
181,1,2015-08-08,2015-11-03
154,2,2011-01-19,2011-04-11
155,2,2011-02-19,2011-04-11
119,9,2022-06-10,NULL
112,9,2022-04-10,2023-06-10
143,12,2013-05-01,2013-06-01
173,12,2013-01-01,2014-01-01
144,13,2015-02-01,2015-04-11
145,13,2015-03-01,2015-04-21
144,19,2016-02-13,2016-05-21
145,19,2016-01-20,2016-04-11
141,20,2017-02-01,2017-05-01
195,20,2017-03-01,2017-06-01
199,21,2023-09-11,NULL
199,20,2023-09-11,NULL
198,21,2023-09-15,NULL
102,22,2023-08-05,NULL
197,22,2023-07-07,NULL
116,28,2023-07-03,NULL
190,28,2023-08-11,NULL
218,10,05/16/2022,NULL
143,10,2022-01-01,05/27/2022 
*/
  resultArray.sort((a, b) => b.workedTogether - a.workedTogether);

  return (
    <div className="app">
      <header className="app-header">My application for Sirma Solutions</header>
      <main className="main-section">
        <div className="form-section">
          <label className="form-header" htmlFor="csvInput">
            Enter CSV File
          </label>
          <input
            onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            accept="text/csv"
          />
          <div>
            <button className="parse-button" onClick={handleParse}>
              Parse
            </button>
          </div>
          <div>
            {error
              ? error
              : resultArray.map((emp, idx) => (
                  <div className="output-box" key={idx}>
                    <div className="emp-one-id">
                      <h4 className="row-number">{idx + 1}.</h4>
                      <h5>Employee#1ID:</h5>
                      <h3>{emp.EmpOne}</h3>
                    </div>
                    <div className="emp-two-id">
                      <h5>Employee#2ID:</h5>
                      <h3>{emp.EmpTwo}</h3>
                    </div>
                    <div className="project-id">
                      <h5>ProjectID:</h5>
                      <h3>{emp.ProjectID}</h3>
                    </div>
                    <div className="worked-together">
                      <h5>WorkedTogether:</h5>
                      <h3>{emp.workedTogether} days</h3>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
