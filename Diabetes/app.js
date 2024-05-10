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


