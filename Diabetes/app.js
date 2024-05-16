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
    axios.get('patients', {
      responseType: 'json'
    })
      .then(function(response) {
        var select = document.getElementById('patient-select');
  
        while (select.options.length > 0) {
          select.options.remove(0);
        }
  
        for (var i = 0; i < response.data.length; i++) {
          var id = response.data[i]['id'];
          var name = response.data[i]['name'];
          select.appendChild(new Option(name, id));
        }

      })
      .catch(function(response) {
        alert('URI /patients not properly implemented in Flask');
      });
  }

document.addEventListener('DOMContentLoaded', function() {
    
    refreshPatients();
    const form = document.getElementById('dataForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const patientId = document.getElementById('patient-select').value;

        const formData = new FormData(form);

        const data = {
            id: patientId
        };
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // POST request to API 
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
        var name = document.getElementById('patient-input').value;
        if (name == '') {
          alert('No name was provided');
        } else {
          axios.post('create-patient', {
            name: name
          })
            .then(function(response) {
              document.getElementById('patient-input').value = '';
              refreshPatients();
            })
            .catch(function(response) {
              alert('URI /create-patient not properly implemented in Flask');
            });
        }
    });
});


function updateStressLevelPercentage() {
  var stressLevel = document.getElementById('stressLevel').value;
  document.getElementById('stressLevelPercentage').textContent = stressLevel;
}

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

function searchPatient(name) {
  axios.get('/search-patient', { params: { name: name } })
  .then(function(response) {
    var patient = response.data;
    var data = document.getElementById('patientList');
    data.innerHTML = '';

    patient.forEach(function(patient) {
      var option = document.createElement('option');
      option.textContent = patient.name;
      data.appendChild(option);
    });
  })
  .catch(function(error) {
    console.error("Error searching patient", error);
  });
}

function saveData() {
  var patient = document.getElementById('patientList').value;
  var glucose = document.getElementById('glucose').value;
  var weight = document.getElementById('weight').value;
  var blood = document.getElementById('blood').value;
  var insulin = document.getElementById('insulin').value;
  var cholesterol = document.getElementById('cholesterol').value;
  var sport = document.getElementById('sport').value;
  var stress = document.getElementById('stressLevel').value;
  var comments = document.getElementById('comments').value;

  if (patient.trim() === '') {
    alert("Please select a patient");
    return;
  }

  axios.post('/create-select-patient', {
    name: patient,
    glucose: glucose,
    weight: weight,
    blood: blood,
    insulin: insulin,
    cholesterol: cholesterol,
    sport: sport,
    stress: stress,
    comments: comments
  
  })
  .then(function(response) {
    alert("Data recorded successfully");
    document.getElementById('patient').value = '';
    document.getElementById('glucose').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('blood').value = '';
    document.getElementById('insulin').value = '';
    document.getElementById('cholesterol').value = '';
    document.getElementById('sport').value = '';
    document.getElementById('stressLevel').value = '';
    document.getElementById('comments').value = '';
  })
  .catch(function(error) {
    console.error("Error recording data", error);
    alert("Error recording data");
  });
}

var patientNameInput = document.getElementById('patientName');
patientNameInput.addEventListener('input', function() {
  searchPatient(patientNameInput.value);
});

var stressLevelInput = document.getElementById('stressLevel');
stressLevelInput.addEventListener('input', updateStressLevelPercentage);


// function recordData() {
//   // example of data 
//   var data = {
//     id: 1,
//     glusocse: 120,
//     weight: 70,
//     blood: '120/80',
//     insulin: 10,
//     cholesterol: 200,
//     sport: 6,
//     stress: 10,
//     comments: "No comments"
//   };

//   axios.post('/record', data)
//   .then(function(response) {
//     alert("Data recorded successfully");
//   })
//   .catch(function(error) {
//     console.error("Error recording data", error);
//     alert("Error recording data");
//   });
// }

// function createPatient() {
//   var name = document.getElementById('patientName').value;
//   if (name.trim() !== '') {
//       axios.post('/create-patient', { name: name })
//         .then(function(response) {
//           listPatients();
//           alert("Patient created successfully");
//         })
//         .catch(function(error) {
//           console.error("Error creating patient", error);
//           alert("Error creating patient");
//         });
//   } else {
//     alert("Please enter a name for the patient");
//   }
// }

// function listPatients() {
//   axios.get('/patients')
//   .then(function(response) {
//     var patients = response.data;
//     var patientList = document.getElementById('patientList');
//     patientList.innerHTML = '';
//     patients.forEach(function(patient) {
//       var li = document.createElement('div');
//       li.textContent = patient.name;
//       patientList.appendChild(li);
//     });
//   })
//   .catch(function(error) {
//     console.error("Error listing patients", error);
//     alert("Error listing patients");
//   });
// }