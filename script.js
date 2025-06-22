// Sample data for demonstration
let facultyForms = [
    {
        id: 1,
        title: "Mini Project Report Submission",
        description: "Form for collecting mini project reports from final year students",
        createdAt: "2024-03-15",
        responses: 24,
        fields: [
            { id: 'name', type: 'text', label: 'Full Name', required: true },
            { id: 'rollno', type: 'text', label: 'Roll Number', required: true },
            { id: 'department', type: 'select', label: 'Department', required: true, options: 'Computer,Mechanical,Electrical,Civil,ENTC' },
            { id: 'projectTitle', type: 'text', label: 'Project Title', required: true },
            { id: 'projectFile', type: 'file', label: 'Project Report (PDF)', required: true },
            { id: 'abstract', type: 'textarea', label: 'Project Abstract', required: true }
        ],
        responsesData: [
            {
                id: 1,
                studentName: "Rahul Sharma",
                rollNo: "COE2021001",
                department: "Computer",
                submissionDate: "2024-03-20 14:30",
                data: {
                    name: "Rahul Sharma",
                    rollno: "COE2021001",
                    department: "Computer",
                    projectTitle: "AI Based Attendance System",
                    projectFile: "rahul_project.pdf",
                    abstract: "An AI based system for automatic attendance using facial recognition."
                }
            },
            {
                id: 2,
                studentName: "Priya Patel",
                rollNo: "COE2021023",
                department: "ENTC",
                submissionDate: "2024-03-21 10:15",
                data: {
                    name: "Priya Patel",
                    rollno: "COE2021023",
                    department: "ENTC",
                    projectTitle: "IoT Based Smart Irrigation",
                    projectFile: "priya_project.pdf",
                    abstract: "Smart irrigation system that monitors soil moisture and controls water flow."
                }
            }
        ]
    },
    {
        id: 2,
        title: "Industrial Visit Feedback",
        description: "Collect feedback from students about the recent industrial visit",
        createdAt: "2024-03-10",
        responses: 18,
        fields: [
            { id: 'name', type: 'text', label: 'Full Name', required: true },
            { id: 'rollno', type: 'text', label: 'Roll Number', required: true },
            { id: 'company', type: 'text', label: 'Visited Company', required: true },
            { id: 'rating', type: 'radio', label: 'Overall Rating', required: true, options: 'Excellent,Good,Average,Poor' },
            { id: 'feedback', type: 'textarea', label: 'Your Feedback', required: false }
        ],
        responsesData: [
            {
                id: 1,
                studentName: "Amit Singh",
                rollNo: "COE2021015",
                department: "Mechanical",
                submissionDate: "2024-03-12 09:45",
                data: {
                    name: "Amit Singh",
                    rollno: "COE2021015",
                    company: "TATA Motors",
                    rating: "Good",
                    feedback: "The visit was informative but too short."
                }
            }
        ]
    }
];

// Current state variables
let currentFormId = null;
let currentResponseId = null;
let currentSection = 'dashboard';

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    // Navigation event listeners
    document.getElementById('dashboardLink').addEventListener('click', function (e) {
        e.preventDefault();
        showSection('dashboard');
    });

    document.getElementById('createFormLink').addEventListener('click', function (e) {
        e.preventDefault();
        showSection('createForm');
    });

    document.getElementById('responsesLink').addEventListener('click', function (e) {
        e.preventDefault();
        showSection('responses');
    });

    // Form builder submission
    document.getElementById('formBuilder').addEventListener('submit', function (e) {
        e.preventDefault();
        createNewForm();
    });

    // Initialize dashboard
    updateDashboard();
    loadRecentForms();
    loadResponseTable();
    populateFormFilter();
});

// Show the selected section
function showSection(section) {
    // Hide all sections
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('createFormSection').style.display = 'none';
    document.getElementById('responsesSection').style.display = 'none';

    // Remove active class from all nav links
    document.querySelectorAll('.faculty-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section and update nav
    switch (section) {
        case 'dashboard':
            document.getElementById('dashboardSection').style.display = 'block';
            document.getElementById('dashboardLink').classList.add('active');
            currentSection = 'dashboard';
            break;
        case 'createForm':
            document.getElementById('createFormSection').style.display = 'block';
            document.getElementById('createFormLink').classList.add('active');
            currentSection = 'createForm';
            break;
        case 'responses':
            document.getElementById('responsesSection').style.display = 'block';
            document.getElementById('responsesLink').classList.add('active');
            currentSection = 'responses';
            break;
    }
}

// Update dashboard statistics
function updateDashboard() {
    document.getElementById('totalFormsCount').textContent = facultyForms.length;

    let totalResponses = 0;
    facultyForms.forEach(form => {
        totalResponses += form.responses;
    });
    document.getElementById('totalResponsesCount').textContent = totalResponses;

    // For demo, assume all forms are active
    document.getElementById('activeFormsCount').textContent = facultyForms.length;
}

// Load recent forms on dashboard
function loadRecentForms() {
    const container = document.getElementById('recentFormsList');
    container.innerHTML = '';

    // Sort forms by creation date (newest first)
    const sortedForms = [...facultyForms].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Show only the 4 most recent forms
    const recentForms = sortedForms.slice(0, 4);

    recentForms.forEach(form => {
        const formCol = document.createElement('div');
        formCol.className = 'col-md-6 mb-4';

        formCol.innerHTML = `
                    <div class="card form-card h-100">
                        <div class="card-header form-card-header">
                            <h5 class="mb-0">${form.title}</h5>
                        </div>
                        <div class="card-body">
                            <p class="card-text">${form.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge badge-mgm">${form.responses} responses</span>
                                <small class="text-muted">Created: ${form.createdAt}</small>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-sm btn-mgm-primary me-2" onclick="viewFormResponses(${form.id})">
                                <i class="fas fa-eye me-1"></i>View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="shareFormLink(${form.id})">
                                <i class="fas fa-share-alt me-1"></i>Share
                            </button>
                        </div>
                    </div>
                `;

        container.appendChild(formCol);
    });
}

// Add a new field to the form builder
function addFormField() {
    const container = document.getElementById('formFieldsContainer');

    const fieldId = 'field-' + Date.now();

    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field-card mb-3';
    fieldDiv.id = fieldId;

    fieldDiv.innerHTML = `
                <div class="d-flex justify-content-between mb-2">
                    <h6 class="mb-0">New Field</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFormField('${fieldId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="row g-2">
                    <div class="col-md-4">
                        <label class="form-label">Field Type</label>
                        <select class="form-select field-type" onchange="updateFieldOptions(this)">
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="email">Email</option>
                            <option value="textarea">Text Area</option>
                            <option value="select">Dropdown</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="radio">Radio Buttons</option>
                            <option value="file">File Upload</option>
                            <option value="date">Date</option>
                        </select>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Field Label</label>
                        <input type="text" class="form-control field-label" placeholder="Enter field label">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Required</label>
                        <select class="form-select field-required">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
                <div class="field-options-container mt-2" style="display: none;">
                    <label class="form-label">Options (comma separated)</label>
                    <input type="text" class="form-control field-options" placeholder="Option 1, Option 2, Option 3">
                </div>
            `;

    container.appendChild(fieldDiv);
}

// Remove a field from the form builder
function removeFormField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.remove();
    }
}

// Show/hide options input based on field type
function updateFieldOptions(select) {
    const fieldCard = select.closest('.form-field-card');
    const optionsContainer = fieldCard.querySelector('.field-options-container');

    if (select.value === 'select' || select.value === 'checkbox' || select.value === 'radio') {
        optionsContainer.style.display = 'block';
    } else {
        optionsContainer.style.display = 'none';
    }
}

// Reset the form builder
function resetFormBuilder() {
    document.getElementById('formBuilder').reset();
    document.getElementById('formFieldsContainer').innerHTML = '';
    showSection('dashboard');
}

// Create a new form
function createNewForm() {
    const title = document.getElementById('formTitle').value.trim();
    const description = document.getElementById('formDescription').value.trim();

    if (!title) {
        alert('Please enter a form title');
        return;
    }

    // Collect all fields
    const fieldElements = document.querySelectorAll('.form-field-card');
    const fields = [];

    fieldElements.forEach(fieldEl => {
        const type = fieldEl.querySelector('.field-type').value;
        const label = fieldEl.querySelector('.field-label').value.trim();
        const required = fieldEl.querySelector('.field-required').value === 'true';
        let options = '';

        if (!label) {
            alert('Please enter a label for all fields');
            return;
        }

        if (type === 'select' || type === 'checkbox' || type === 'radio') {
            options = fieldEl.querySelector('.field-options').value.trim();
            if (!options) {
                alert('Please enter options for field: ' + label);
                return;
            }
        }

        // Generate a simple ID for the field
        const id = label.toLowerCase().replace(/\s+/g, '-');

        fields.push({
            id: id,
            type: type,
            label: label,
            required: required,
            options: options
        });
    });

    if (fields.length === 0) {
        alert('Please add at least one field to the form');
        return;
    }

    // Create new form object
    const newForm = {
        id: facultyForms.length + 1,
        title: title,
        description: description,
        createdAt: new Date().toISOString().split('T')[0],
        responses: 0,
        fields: fields,
        responsesData: []
    };

    // Add to forms array
    facultyForms.push(newForm);

    // Reset form and show dashboard
    resetFormBuilder();

    // Update dashboard
    updateDashboard();
    loadRecentForms();

    // Show success message and share option
    alert('Form created successfully!');
    shareFormLink(newForm.id);
}

// Share form link
function shareFormLink(formId) {
    const form = facultyForms.find(f => f.id === formId);
    if (!form) return;

    // In a real app, this would be a proper URL to the form
    const formLink = `https://mgmcoe.edu/forms/${formId}`;

    document.getElementById('formShareLink').value = formLink;

    // Set up share buttons
    document.getElementById('whatsappShareBtn').href = `https://wa.me/?text=${encodeURIComponent(`Please fill out this form: ${formLink}`)}`;
    document.getElementById('emailShareBtn').href = `mailto:?subject=${encodeURIComponent(`Form: ${form.title}`)}&body=${encodeURIComponent(`Please fill out this form:\n${formLink}`)}`;

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('formLinkModal'));
    modal.show();
}

// Copy form link to clipboard
function copyFormLink() {
    const linkInput = document.getElementById('formShareLink');
    linkInput.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

// Load responses table
function loadResponseTable() {
    const tableBody = document.getElementById('responsesTable');
    tableBody.innerHTML = '';

    // Combine all responses from all forms
    let allResponses = [];
    facultyForms.forEach(form => {
        form.responsesData.forEach(response => {
            allResponses.push({
                formId: form.id,
                formTitle: form.title,
                ...response
            });
        });
    });

    // Sort by submission date (newest first)
    allResponses.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));

    // Add to table
    allResponses.forEach(response => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${response.formTitle}</td>
                    <td>${response.studentName}</td>
                    <td>${response.rollNo}</td>
                    <td>${response.department}</td>
                    <td>${response.submissionDate}</td>
                    <td>
                        <button class="btn btn-sm btn-mgm-primary" onclick="viewResponseDetails(${response.formId}, ${response.id})">
                            <i class="fas fa-eye me-1"></i>View
                        </button>
                    </td>
                `;
        tableBody.appendChild(row);
    });
}

// Populate form filter dropdown
function populateFormFilter() {
    const filter = document.getElementById('responseFormFilter');
    filter.innerHTML = '<option value="all">All Forms</option>';

    facultyForms.forEach(form => {
        const option = document.createElement('option');
        option.value = form.id;
        option.textContent = form.title;
        filter.appendChild(option);
    });
}

// View form responses
function viewFormResponses(formId) {
    // In a complete implementation, this would filter the responses table
    document.getElementById('responseFormFilter').value = formId;
    showSection('responses');
}

// View response details
function viewResponseDetails(formId, responseId) {
    const form = facultyForms.find(f => f.id === formId);
    if (!form) return;

    const response = form.responsesData.find(r => r.id === responseId);
    if (!response) return;

    currentFormId = formId;
    currentResponseId = responseId;

    const detailsContent = document.getElementById('responseDetailsContent');
    detailsContent.innerHTML = `
                <h4>${form.title}</h4>
                <div class="row mb-4">
                    <div class="col-md-6">
                        <p><strong>Student Name:</strong> ${response.studentName}</p>
                        <p><strong>Roll Number:</strong> ${response.rollNo}</p>
                        <p><strong>Department:</strong> ${response.department}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Submission Date:</strong> ${response.submissionDate}</p>
                    </div>
                </div>
                <hr>
                <h5 class="mb-3">Response Details</h5>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${form.fields.map(field => `
                            <tr>
                                <td><strong>${field.label}</strong></td>
                                <td>${formatResponseValue(response.data[field.id], field.type)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

    const modal = new bootstrap.Modal(document.getElementById('responseDetailsModal'));
    modal.show();
}

// Format response value based on field type
function formatResponseValue(value, type) {
    if (!value) return '-';

    if (type === 'file') {
        return `<a href="#" class="text-primary">${value}</a>`;
    }

    return value;
}

// Export responses
function exportResponses() {
    const formId = document.getElementById('responseFormFilter').value;

    if (formId === 'all') {
        alert('Exporting all responses as CSV');
    } else {
        alert(`Exporting responses for form ID ${formId} as CSV`);
    }

    // In a real app, this would generate and download a CSV file
}

// Print response
function printResponse() {
    window.print();
}