document.addEventListener('DOMContentLoaded', () => {
    // Logic for copying the form link to clipboard
    const copyButtons = document.querySelectorAll('.copy-link-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const input = e.currentTarget.previousElementSibling;
            input.select();
            document.execCommand('copy');
            
            // Visual feedback
            e.currentTarget.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                e.currentTarget.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    });

    // Logic for live search of submissions
    const searchInput = document.getElementById('searchInput');
    const submissionsTable = document.getElementById('submissionsTable');

    if (searchInput) {
        searchInput.addEventListener('keyup', async (e) => {
            const searchQuery = e.target.value.trim();

            if (searchQuery.length < 1) {
                // If search is cleared, you might want to reload or fetch all results
                // For now, we'll just let the user clear it. A full reload is an option.
                // window.location.reload(); 
                return;
            }

            try {
                const response = await fetch(`/dashboard/submissions/search?name=${encodeURIComponent(searchQuery)}`);
                if (!response.ok) {
                    throw new Error('Search request failed');
                }
                const submissions = await response.json();
                renderSubmissionsTable(submissions);
            } catch (error) {
                console.error('Search error:', error);
                submissionsTable.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error fetching search results.</td></tr>`;
            }
        });
    }

    function renderSubmissionsTable(submissions) {
        submissionsTable.innerHTML = ''; // Clear existing rows
        if (submissions.length === 0) {
            submissionsTable.innerHTML = `<tr><td colspan="5" class="text-center">No results found.</td></tr>`;
            return;
        }

        submissions.forEach(sub => {
            const row = `
                <tr>
                    <td>
                        <strong>${sub.studentName}</strong><br>
                        <small class="text-muted">${sub.rollNumber}</small>
                    </td>
                    <td>${sub.projectTitle}</td>
                    <td><span class="badge bg-secondary">${sub.formId.title}</span></td>
                    <td>${new Date(sub.createdAt).toLocaleString()}</td>
                    <td><a href="${sub.reportFileUrl}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fas fa-file-pdf me-1"></i> View PDF</a></td>
                </tr>
            `;
            submissionsTable.innerHTML += row;
        });
    }
});


// public/js/main.js
// ... (keep the copy-link-btn logic at the top)


// ===============================================================
// NEW: Logic for dynamically updating the submissions table
// ===============================================================
const submissionsTable = document.getElementById('submissions-table');

// This function will only run if we are on the form-details page
if (submissionsTable) {
    const formId = submissionsTable.dataset.formId;

    // Start polling every 10 seconds
    setInterval(() => {
        fetchSubmissions(formId);
    }, 10000); // 10000 milliseconds = 10 seconds
}

async function fetchSubmissions(formId) {
    try {
        const response = await fetch(`/dashboard/api/forms/${formId}/submissions`);
        if (!response.ok) return; // Don't do anything if the request fails

        const data = await response.json();
        const newSubmissions = data.submissions;

        // Get the current number of rows in the table
        const currentRowCount = submissionsTable.rows.length;

        // If the number of new submissions is greater than what's on screen, update the table
        if (newSubmissions.length > currentRowCount) {
            console.log("New submissions found! Updating table.");
            renderTable(newSubmissions);
        }

    } catch (error) {
        console.error("Failed to fetch submissions:", error);
    }
}

function renderTable(submissions) {
    // Clear the current table content
    submissionsTable.innerHTML = '';

    if (submissions.length === 0) {
        const emptyRow = `<tr><td colspan="100%" class="text-center p-4">No submissions received yet.</td></tr>`;
        submissionsTable.innerHTML = emptyRow;
        return;
    }
    
    // This is a bit tricky: we need the form's field definitions to build the table correctly.
    // Since we don't have them on the client side, we will just reload the page.
    // This is the simplest and most reliable way to ensure the table is 100% correct.
    // A more advanced solution would involve passing the form fields to the script.
    
    // Simple and reliable solution: just reload the page to get the new server-rendered data.
    window.location.reload();
}