/**
 * Copyright (c) 2024, Sebastien Jodogne, ICTEAM UCLouvain, Belgium
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/


function refreshPatients() {
  axios.get('/patients', {
    responseType: 'json'
  })
    .then(function(response) {
      var select = document.getElementById('patientList');

      while (select.options.length > 0) {
        select.options.remove(0);
      }

      for (var i = 0; i < response.data.length; i++) {
        var id = response.data[i]['id'];
        var name = response.data[i]['name'];
        select.appendChild(new Option(name, id));
      }

    })
    .catch(function(error) {
      alert('URI /patients not properly implemented in Flask');
    });
}

document.addEventListener('DOMContentLoaded', function() {
  refreshPatients();
  const form = document.getElementById('dataForm');

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const patientId = document.getElementById('patientName').value;

    const formData = new FormData(form);

    const data = {
      patient: patientId 
    };
    formData.forEach((value, key) => {
      data[key] = value;
    });

    axios.post('/record', data)
      .then(response => {
        if (response.status === 204) {
          alert('Data saved successfully!');
          form.reset();
        } else {
          alert('Failed to save data. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to save data. Please try again.');
      });
  });

  document.getElementById('patient-button').addEventListener('click', function() {
    var name = document.getElementById('patientName').value; 
    if (name == '') {
      alert('No name was provided');
    } else {
      axios.post('/create-select-patient', { 
        name: name
      })
        .then(function(response) {
          document.getElementById('patientName').value = ''; 
          refreshPatients();
        })
        .catch(function(error) { 
          alert('URI /create-patient not properly implemented in Flask');
        });
    }
  });
});


function updateStressLevelPercentage() {
var stressLevel = document.getElementById('stressLevel').value;
document.getElementById('stressLevelPercentage').textContent = stressLevel;
}

// Function to create a patient
function createPatient() {
var patient = document.getElementById('patientName').value;
if (patient.trim() === '') {
  alert("Please enter a name for the patient");
  return;
}

axios.post('/create-select-patient', { name: patient })
.then(function (response) {
    console.log('Patient saved:', response.data);
    alert('Patient saved successfully.');
})
.catch(function (error) {
    console.error('Error saving patient:', error);
    alert('Failed to save patient. Please try again.');
});
}

// Function to search for a patient and show it in datalist
function searchPatient(name) {
  if (name.trim() === '') {
    return;
  }

  axios.get('/patients?name=' + name)
    .then(function (response) {
      var patients = response.data;
      var dataList = document.getElementById('patientList');
      dataList.innerHTML = '';

      patients.forEach(function(patient) {
        var option = document.createElement('option');
        option.value = patient.name + '-' + patient.id;
        dataList.appendChild(option);
      });
    })
    .catch(function (error) { 
      console.error('Error searching patient:', error);
    });
}

// Function to save data and post to record
function saveData() {
  var patient = document.getElementById('patientName').value;
  var glucose = document.getElementById('glucoseLevel').value;
  var weight = document.getElementById('weight').value;
  var blood = document.getElementById('bloodPressure').value;
  var insulin = document.getElementById('insulinDose').value;
  var cholesterol = document.getElementById('cholesterolLevel').value;
  var sport = document.getElementById('hoursOfPhysicalSport').value;
  var stress = document.getElementById('stressLevel').value;
  var comments = document.getElementById('personalComments').value;

  var data = {
    patient: patient,
    glucose: glucose,
    weight: weight,
    blood: blood,
    insulin: insulin,
    cholesterol: cholesterol,
    sport: sport,
    stress: stress,
    comments: comments
  };

  axios.post('/record', data)
    .then(function (response) {
      console.log('Data saved:', response.data);
      alert('Data saved successfully.');
    })
    .catch(function (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    });
}

// Listener to show the data based on the function fetchDataAndPlot
document.getElementById('showGraphBtn').addEventListener('click', function() {
  const patientInputValue = document.getElementById('patientName').value;
  const patientId = patientInputValue.split('-')[1].trim();
  const parameter = document.getElementById('selectedParameter').value;
  if (!patientId) {
    alert('Please select a patient.');
    return;
  }
  fetchDataAndPlot(patientId, parameter);
});

function fetchDataAndPlot(patientId, parameter) {
  axios.get('/patient-records/' + patientId)
    .then(function(response) {
      const records = response.data;

      if (!records || records.length === 0) {
        alert('No records found for this patient.');
        return;
      }

      const paramValues = records.map(record => record[parameter]);
      const dates = records.map(record => new Date(record.time));

      const data = [{
        x: dates,
        y: paramValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: parameter.replace('-', ' ').toUpperCase()
      }];
      const layout = {
        title: `${parameter.replace('_', ' ').toUpperCase()} Over Time`,
        xaxis: {
          title: 'Date'
        },
        yaxis: {
          title: parameter.replace('-', ' ').toUpperCase()
        }
      };
      Plotly.newPlot('graphs', data, layout);
    })
    .catch(function(error) {
      console.error('Error fetching patient records:', error);
      alert('Failed to fetch patient records.');
    });
}

// Listener for the patient
var patientNameInput = document.getElementById('patientName');
patientNameInput.addEventListener('input', function() {
searchPatient(patientNameInput.value);
});

// Listener for the slider stress level
var stressLevelInput = document.getElementById('stressLevel');
stressLevelInput.addEventListener('input', updateStressLevelPercentage);