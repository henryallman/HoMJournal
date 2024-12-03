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

// Delete functionality with confirmation
document.querySelector('.delete-btn').addEventListener('click', async () => {
    const confirmDelete = confirm("Are you sure you want to delete this entry? This action cannot be undone.");
    
    if (confirmDelete) {
        try {
            const response = await fetch(`/deleteEntry/${entryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Store deleted entry data for potential undo
                const deletedEntry = {
                    date: document.querySelector("input.date").value,
                    habit: document.querySelector("input.habits:checked")?.value,
                    content: document.querySelector("textarea.content").value
                };

                // Save to sessionStorage for undo feature
                sessionStorage.setItem('deletedEntry', JSON.stringify(deletedEntry));

                // Show temporary undo message with countdown
                const undoMessage = document.createElement('div');
                undoMessage.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #333;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                `;
                
                const countdownSpan = document.createElement('span');
                let secondsLeft = 5;
                
                undoMessage.innerHTML = `
                    Entry deleted 
                    <button onclick="undoDelete()" style="background-color: #4CAF50; border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        Undo
                    </button>
                    <span style="margin-left: 10px;">Returning to menu in <span id="countdown">${secondsLeft}</span> seconds</span>
                `;
                document.body.appendChild(undoMessage);

                // Start countdown
                const countdownInterval = setInterval(() => {
                    secondsLeft--;
                    const countdownElement = document.getElementById('countdown');
                    if (countdownElement) {
                        countdownElement.textContent = secondsLeft;
                    }
                    if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                        undoMessage.remove();
                        window.location.href = '/';
                    }
                }, 1000);

            } else {
                throw new Error('Failed to delete entry');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete entry: ' + error.message);
        }
    }
});

// Add this function to handle undo
window.undoDelete = async function() {
    try {
        const deletedEntry = JSON.parse(sessionStorage.getItem('deletedEntry'));
        if (!deletedEntry) return;

        // Ensure the date is properly formatted
        const formattedEntry = {
            ...deletedEntry,
            date: new Date(deletedEntry.date).toISOString().split('T')[0]  // Ensure proper date format
        };

        const response = await fetch('/createEntry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedEntry)
        });

        if (response.ok) {
            sessionStorage.removeItem('deletedEntry');
            window.location.href = '/';
        } else {
            throw new Error('Failed to restore entry');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to restore entry: ' + error.message);
    }
};