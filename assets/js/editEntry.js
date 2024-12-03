// Get the entry ID from the URL path
const entryId = window.location.pathname.split('/').pop();

// Fetch the existing entry data when page loads
window.addEventListener('load', async () => {
    const response = await fetch(`/getEntry/${entryId}`);
    const entry = await response.json();
    
    // Format the date to YYYY-MM-DD for the date input
    const date = new Date(entry.date);
    const formattedDate = date.toISOString().split('T')[0];
    
    // Populate form fields with existing data
    document.querySelector("input.date").value = formattedDate;
    if (entry.habit) {
        document.querySelector(`input.habits[value="${entry.habit}"]`).checked = true;
    }
    document.querySelector("textarea.content").value = entry.content;
});

const submitButton = document.querySelector("input.submit");
submitButton.addEventListener("click", async() => {
    try {
        // Get values from the entry form
        const date = document.querySelector("input.date").value;
        const homButtons = document.querySelectorAll("input.habits:checked");
        const habitOfMind = homButtons.length > 0 ? homButtons[0].value : null;
        const content = document.querySelector("textarea.content").value;
        
        const entry = {id: entryId, date, habit: habitOfMind, content};
        console.log('Attempting to send update with data:', entry);

        // Send a PUT request to the router and wait for a response
        const response = await fetch(`/updateEntry/${entryId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(entry),
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (response.ok) {
            console.log('Update successful, redirecting...');
            window.location.href = "/";  // Changed to be more explicit
        } else {
            console.error("Server responded with status:", response.status);
            console.error("Error message:", responseText);
            alert(`Error updating entry: ${responseText}`);
        }
    } catch (error) {
        console.error("Detailed error:", error);
        alert(`Error updating entry: ${error.message}`);
    }
});