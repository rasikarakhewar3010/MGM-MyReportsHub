document.addEventListener('DOMContentLoaded', function () {
    // Navigation event listeners
    document.getElementById('dashboardLink').addEventListener('click', (e) => { e.preventDefault(); showSection('dashboard'); });
    document.getElementById('createFormLink').addEventListener('click', (e) => { e.preventDefault(); showSection('createForm'); });
    document.getElementById('responsesLink').addEventListener('click', (e) => { e.preventDefault(); showSection('responses'); });
    
    // Form builder submission
    document.getElementById('formBuilder').addEventListener('submit', createNewForm);
    
    // Search input listener
    const searchInput = document.getElementById('studentSearchInput');
    if(searchInput) {
        let searchTimeout;
        searchInput.addEventListener('keyup', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchStudents(e.target.value);
            }, 500); // Debounce search
        });
    }
});

function showSection(section) {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('createFormSection').style.display = 'none';
    document.getElementById('responsesSection').style.display = 'none';

    document.querySelectorAll('.faculty-nav .nav-link').forEach(link => link.classList.remove('active'));

    switch (section) {
        case 'dashboard':
            document.getElementById('dashboardSection').style.display = 'block';
            document.getElementById('dashboardLink').classList.add('active');
            break;
        case 'createForm':
            document.getElementById('createFormSection').style.display = 'block';
            document.getElementById('createFormLink').classList.add('active');
            break;
        case 'responses':
            document.getElementById('responsesSection').style.display = 'block';
            document.getElementById('responsesLink').classList.add('active');
            break;
    }
}

// ... (Your `addFormField`, `removeFormField`, `updateFieldOptions` functions from original file can be pasted here without changes) ...

function addFormField() { /* Your original code */ }
function removeFormField(fieldId) { /* Your original code */ }
function updateFieldOptions(select) { /* Your original code */ }

function resetFormBuilder() {
    document.getElementById('formBuilder').reset();
    document.getElementById('formFieldsContainer').innerHTML = '';
    showSection('dashboard');
}

async function createNewForm(e) {
    e.preventDefault();
    const title = document.getElementById('formTitle').value.trim();
    const description = document.getElementById('formDescription').value.trim();

    if (!title) {
        alert('Please enter a form title.');
        return;
    }

    const fieldElements = document.querySelectorAll('.form-field-card');
    const fields = Array.from(fieldElements).map(fieldEl => {
        return {
            label: fieldEl.querySelector('.field-label').value.trim(),
            type: fieldEl.querySelector('.field-type').value,
            required: fieldEl.querySelector('.field-required').value,
            options: fieldEl.querySelector('.field-options').value.trim()
        };
    });

    if (fields.some(f => !f.label)) {
        alert('Please provide a label for every field.');
        return;
    }

    try {
        const response = await fetch('/faculty/forms/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, fields })
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            resetFormBuilder();
            // Optionally, reload the page to see the new form
            window.location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Failed to create form:', error);
        alert('An error occurred. Please try again.');
    }
}

function shareFormLink(formId) {
    const formLink = `${window.location.origin}/form/${formId}`;
    document.getElementById('formShareLink').value = formLink;

    document.getElementById('whatsappShareBtn').href = `https://wa.me/?text=${encodeURIComponent(`Please fill out this form: ${formLink}`)}`;
    document.getElementById('emailShareBtn').href = `mailto:?subject=MGM Form&body=${encodeURIComponent(`Please fill out this form:\n${formLink}`)}`;

    const modal = new bootstrap.Modal(document.getElementById('formLinkModal'));
    modal.show();
}

function copyFormLink() {
    const linkInput = document.getElementById('formShareLink');
    linkInput.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

function viewResponseDetails(responseId, submissionData) {
    const detailsContent = document.getElementById('responseDetailsContent');
    let tableRows = '';
    for (const [key, value] of Object.entries(submissionData)) {
        let formattedValue = value;
        if (typeof value === 'string' && (value.startsWith('http') || value.endsWith('.pdf'))) {
            formattedValue = `<a href="${value}" target="_blank" rel="noopener noreferrer">View File</a>`;
        }
        tableRows += `<tr><td><strong>${key}</strong></td><td>${formattedValue}</td></tr>`;
    }
    
    detailsContent.innerHTML = `
        <h5 class="mb-3">Response Details</h5>
        <table class="table table-bordered">
            <tbody>${tableRows}</tbody>
        </table>`;

    const modal = new bootstrap.Modal(document.getElementById('responseDetailsModal'));
    modal.show();
}

async function searchStudents(query) {
    const tableBody = document.getElementById('responsesTable');
    if (!query) {
        // If query is empty, reload the page to show all results
        window.location.reload();
        return;
    }

    try {
        const response = await fetch(`/faculty/search?query=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        tableBody.innerHTML = ''; // Clear current table
        if (results.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No results found.</td></tr>';
            return;
        }

        results.forEach(res => {
            const name = res.submissionData['Full Name'] || res.submissionData['Student Name'] || 'N/A';
            const rollNo = res.submissionData['Roll Number'] || 'N/A';
            const row = `
                <tr data-response-id="${res._id}">
                    <td>${res.formId.title}</td>
                    <td>
                        <strong>${name}</strong><br>
                        <small>Roll: ${rollNo}</small>
                    </td>
                    <td>${new Date(res.createdAt).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-mgm-primary" onclick='viewResponseDetails(${JSON.stringify(res._id)}, ${JSON.stringify(res.submissionData)})'>
                            <i class="fas fa-eye me-1"></i>View
                        </button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Search failed:', error);
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">An error occurred during search.</td></tr>';
    }
}