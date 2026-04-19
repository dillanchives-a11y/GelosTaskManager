//Global Selectors
const searchInput = document.getElementById("search");
const searchBtn = document.querySelector(".search-button"); // method returns a NodeList with the first element that matches a CSS selector. https://www.w3schools.com/jsref/met_document_queryselector.asp
const taskList = document.getElementById("myUL");
const filterBtns = document.querySelectorAll(".filter-btn"); // method returns all elements that matches a CSS selector(s). https://www.w3schools.com/jsref/met_document_queryselectorall.asp
const newBtn = document.getElementById("newTaskBtn") || document.querySelector('[data-filter="new"]');

//Script for new task button
if (newBtn) {
    newBtn.addEventListener("click", function(event) {
        event.preventDefault(); // to stop the double new task creation
        
        // Force view to "All" so the new task isn't hidden by an active filter
        applyFilter("all");
        
        // Create new task
        const newId = "tsk" + Date.now();
        const li = document.createElement('li');
        li.className = "list-items";
        li.setAttribute("data-status", "upcoming");

        li.innerHTML = `
            <input type="checkbox" id="${newId}" name="${newId}">
            <strong class="editable-field" style="color:#a08463;">New Task Name</strong>
            <p class="editable-field">Priority: Low</p>
            <p class="editable-field">Staff: Assign Me</p>
            <button aria-label="Edit" title="Edit" class="icon-button"><i class="fa fa-pencil fa-2x"></i></button>
            <button aria-label="Delete" title="Delete" class="delete-button"><i class="fa fa-trash fa-2x"></i></button>
        `;

        // Add to the top of the list
        taskList.prepend(li);
        
        attachTaskListeners(li); 
        saveAllData(li);

        // Instantly trigger edit mode so user can type
        const editIcon = li.querySelector(".icon-button");
        if (editIcon) editIcon.click();
    });
}

//Task listeners
function attachTaskListeners(li) {
    const editBtn = li.querySelector(".icon-button");
    const deleteBtn = li.querySelector(".delete-button");
    const checkbox = li.querySelector('input[type="checkbox"]');
    const editableFields = li.querySelectorAll(".editable-field");
    let isEditing = false;

    // Toggle edit mode
    editBtn.addEventListener("click", function() {
        isEditing = !isEditing;
        editableFields.forEach(field => {
            field.contentEditable = isEditing;
            field.style.outline = isEditing ? "2px dashed #077A99" : "none";
            field.style.padding = isEditing ? "2px" : "0";
        });

        if (isEditing) {
            editBtn.innerHTML = '<i class="fa fa-check fa-2x"></i>';
            editableFields[0].focus();
        } else {
            editBtn.innerHTML = '<i class="fa fa-pencil fa-2x"></i>';
            saveAllData(li); // Save changes
        }
    });

    // Delete a task
    deleteBtn.addEventListener("click", function() {
        const id = li.querySelector("input").id;
        localStorage.removeItem(`taskData_${id}`);
        li.remove();
    });

    // Checkbox status update
    checkbox.addEventListener("change", function() {
        li.setAttribute("data-status", checkbox.checked ? "completed" : "in-progress");
        saveAllData(li);
    });
}

// Filter & search
function applyFilter(category) {
    // Update button CSS
    filterBtns.forEach(btn => {
        if (btn.getAttribute("data-filter") === category) {
            btn.className = "active-button filter-btn";
        } else {
            btn.className = "inactive-button filter-btn";
        }
    });

    // Show or hide items
    // Select all elements that represent tasks
    const currentItems = document.querySelectorAll(".list-items");
    // Loop over every task element
    currentItems.forEach(li => {
		// Read the task status
        const status = li.getAttribute("data-status");
/*
 * Decide whether to show or hide this task:
 * If the selected category is "all", show every task.
 * Otherwise, show only tasks whose status matches the selected category.
 * Setting style.display to an empty string ("") uses the element's default/CSS display.
 * Setting it to "none" hides the element.
*/
        li.style.display = (category === "all" || status === category) ? "" : "none";
    });
}

function performSearch() {
    const term = searchInput.value.toUpperCase();
    const currentItems = document.querySelectorAll(".list-items");
    currentItems.forEach(li => {
        const text = li.innerText.toUpperCase();
        li.style.display = text.includes(term) ? "" : "none";
    });
}

// Attach filter button events
filterBtns.forEach(btn => {
    const category = btn.getAttribute("data-filter");
    if (category !== "new") {
        btn.addEventListener("click", () => applyFilter(category));
    }
});

searchBtn.addEventListener("click", performSearch);
searchInput.addEventListener("keyup", performSearch);

//Storage helpers
// https://www.javascripttutorial.net/web-apis/javascript-localstorage/
function saveAllData(item) {
    const input = item.querySelector("input");
    if (!input) return;
    
    const id = input.id;
    const data = {
        task: item.querySelector("strong").innerText,
        priority: item.querySelectorAll("p")[0].innerText,
        staff: item.querySelectorAll("p")[1].innerText,
        status: item.getAttribute("data-status"),
        checked: input.checked
    };
    // https://www.w3schools.com/js/js_json_stringify.asp
    localStorage.setItem(`taskData_${id}`, JSON.stringify(data));
}

function loadAllFromStorage() {
    taskList.innerHTML = ""; // Clear list
    
    Object.keys(localStorage).forEach(key => {
		// Only handle keys that follow the task naming convention
        if (key.startsWith("taskData_")) {
			// Get the data from the JavaScript Object Notation string in local storage and convert it back into the JavaScript object.
            const data = JSON.parse(localStorage.getItem(key));
            // Remove taskData_ to get the id
            const id = key.replace("taskData_", "");
            
            const li = document.createElement('li');
            li.className = "list-items";
            li.setAttribute("data-status", data.status || "upcoming");
            li.innerHTML = `
                <input type="checkbox" id="${id}" ${data.checked ? 'checked' : ''}>
                <strong class="editable-field" style="color:#a08463;">${data.task}</strong>
                <p class="editable-field">${data.priority}</p>
                <p class="editable-field">${data.staff}</p>
                <button class="icon-button"><i class="fa fa-pencil fa-2x"></i></button>
                <button class="delete-button"><i class="fa fa-trash fa-2x"></i></button>
            `;
             // Add the constructed li to the task list in the DOM
            taskList.appendChild(li);
            attachTaskListeners(li);
        }
    });
}

// Get data from local storage
window.onload = loadAllFromStorage;
