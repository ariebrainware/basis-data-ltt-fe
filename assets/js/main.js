import swal from 'sweetalert2';

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

const dataPasienForm = document.getElementById('dataPasienForm');
if (dataPasienForm) {
  dataPasienForm.addEventListener('submit', event => {
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

    registerPatient(patientData);
  });
}
function registerPatient(patientData) {
  if (!patientData || !patientData["full_name"] || !patientData["phone_number"]) {
    console.error('Invalid patient data provided.');
    return;
  }

  // Enable CORS for the local backend by ensuring the fetch call uses mode 'cors'
  // const originalFetch = window.fetch;
  // window.fetch = (url, options = {}) => originalFetch(url, { ...options, mode: 'cors' });

  fetch('http://localhost:19091/patient', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to register patient.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Patient registered successfully:', data);
      swal.fire({
        title: "Success",
        text: "Patient registered successfully!",
        icon: "success"
      });
      // Additional logic after successful registration
    })
    .catch(error => {
      console.error('Error during patient registration:', error);
    });
}
