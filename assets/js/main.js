import $ from 'jquery';
window.$ = $;
window.jQuery = $;

import swal from 'sweetalert2';
import Backbone from 'backbone';
import Backgrid from 'backgrid';
// Ensure Backbone uses the imported underscore (if needed)
import _ from 'underscore';
window._ = _;
window.Backbone = Backbone;
window.Backgrid = Backgrid;

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')
  const dataPasienForm = document.getElementById('dataPasienForm');
if (dataPasienForm) {
  dataPasienForm.addEventListener('submit', async event => {
    event.preventDefault();

    const patientData = {
      "full_name": document.getElementById('fullName').value,
      "gender": document.getElementById('gender').value,
      "age": parseInt(document.getElementById('age').value, 10),
      "job": document.getElementById('job').value,
      "address": document.getElementById('address').value,
      "phone_number": document.getElementById('phoneNumber').value
    };

    const selectedCheckboxes = Array.from(dataPasienForm.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    patientData["health_history"] = JSON.stringify(selectedCheckboxes);

    try {
      await registerPatient(patientData);
    } catch (error) {
      console.error("Error registering patient:", error);
    }
  });
}

async function registerPatient(patientData) {
  if (!patientData || !patientData["full_name"] || !patientData["phone_number"]) {
    console.error('Invalid patient data provided.');
    return;
  }

  try {
    const response = await fetch('http://localhost:19091/patient', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });

    if (!response.ok) {
      throw new Error('Failed to register patient.');
    }

    const data = await response.json();
    console.log('Patient registered successfully:', data);
    swal.fire({
      title: "Success",
      text: "Patient registered successfully!",
      icon: "success"
    });
    // Additional logic after successful registration
  } catch (error) {
    console.error('Error during patient registration:', error);
  }
}
})()

// ...existing code...
export async function fetchPatients() {
  try {
    const response = await fetch('http://localhost:19091/patient', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
  
    return await response.json();
  } catch (error) {
    console.error('Error fetching patients:', error);
  }
}

// Attach the function to the window object for global access:
window.fetchPatients = fetchPatients;