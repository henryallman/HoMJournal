const submitButton = document.querySelector("input.submit");
submitButton.addEventListener("click", async() => {
    // Get values from the entry form
    const date = document.querySelector("input.date").value;

    // Find the radio button that is checked
    const homButtons = document.querySelectorAll("input.habits:checked");

    // Equivalent to an if statement homButtons.length > 0 is the condition
    // habitOfMind will be set to the selected button value if the condition is true, null is the condition is false
    const habitOfMind =
        homButtons.length > 0 ? homButtons[0].value : null;

    const content = document.querySelector("textarea.content").value;
    const entry = {date, habit: habitOfMind, content};

    // Send a POST request to the router and wait for a response
    const response = await fetch("/createEntry", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(entry),
    });

    // If the response is ok, go back to the home page
    if (response.ok) {
        window.location = "/";
    } else {
        console.log("Error Creating Entry");
    }
});