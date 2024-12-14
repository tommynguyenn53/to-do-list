// Selecting DOM elements for manipulation
const listsContainer = document.querySelector('[data-lists]') // Container for displaying lists
const newListForm = document.querySelector('[data-new-list-form]') // Form for creating a new list
const newListInput = document.querySelector('[data-new-list-input]') // Input field for entering the new list name
const deleteListButton = document.querySelector('[data-delete-list-button]') // Button to delete the selected list
const listDisplayContainer = document.querySelector('[data-list-display-container]') // Container for displaying tasks of the selected list
const listTitleElement = document.querySelector('[data-list-title]') // Element to display the title of the selected list
const listCountElement = document.querySelector('[data-list-count]') // Element to display the count of incomplete tasks
const tasksContainer = document.querySelector('[data-tasks]') // Container for displaying tasks
const taskTemplate = document.getElementById('task-template') // Template for rendering tasks
const newTaskForm = document.querySelector('[data-new-task-form]') // Form for creating a new task
const newTaskInput = document.querySelector('[data-new-task-input]') // Input field for entering a new task
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]') // Button to clear completed tasks

// Local storage keys for persisting data
const LOCAL_STORAGE_LIST_KEY = 'task.lists' // Key for storing lists
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId' // Key for storing the ID of the selected list

// Variables for managing state
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [] // Retrieve lists from local storage or initialize as empty
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY) // Retrieve the selected list ID from local storage

// Event listener for switching between lists
listsContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') { // Check if a list item was clicked
    selectedListId = e.target.dataset.listId // Update the selected list ID
    saveAndRender() // Save changes and re-render the UI
  }
})

// Event listener for toggling task completion
tasksContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'input') { // Check if a checkbox was clicked
    const selectedList = lists.find(list => list.id === selectedListId) // Find the selected list
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id) // Find the selected task
    selectedTask.complete = e.target.checked // Toggle task completion status
    save() // Save changes to local storage
    renderTaskCount(selectedList) // Update the task count display
  }
})

// Event listener for clearing completed tasks
clearCompleteTasksButton.addEventListener('click', e => {
  const selectedList = lists.find(list => list.id === selectedListId) // Find the selected list
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete) // Remove completed tasks
  saveAndRender() // Save changes and re-render the UI
})

// Event listener for deleting the selected list
deleteListButton.addEventListener('click', e => {
  lists = lists.filter(list => list.id !== selectedListId) // Remove the selected list
  selectedListId = null // Reset the selected list ID
  saveAndRender() // Save changes and re-render the UI
})

// Event listener for adding a new list
newListForm.addEventListener('submit', e => {
  e.preventDefault() // Prevent form submission
  const listName = newListInput.value // Get the entered list name
  if (listName == null || listName === '') return // Do nothing if input is empty
  const list = createList(listName) // Create a new list object
  newListInput.value = null // Clear the input field
  lists.push(list) // Add the new list to the lists array
  saveAndRender() // Save changes and re-render the UI
})

// Event listener for adding a new task
newTaskForm.addEventListener('submit', e => {
  e.preventDefault() // Prevent form submission
  const taskName = newTaskInput.value // Get the entered task name
  if (taskName == null || taskName === '') return // Do nothing if input is empty
  const task = createTask(taskName) // Create a new task object
  newTaskInput.value = null // Clear the input field
  const selectedList = lists.find(list => list.id === selectedListId) // Find the selected list
  selectedList.tasks.push(task) // Add the new task to the selected list
  saveAndRender() // Save changes and re-render the UI
})

// Function to create a new list
function createList(name) {
  return { id: Date.now().toString(), name: name, tasks: [] } // Return a list object with a unique ID and empty tasks array
}

// Function to create a new task
function createTask(name) {
  return { id: Date.now().toString(), name: name, complete: false } // Return a task object with a unique ID and default complete status
}

// Save data to local storage and re-render the UI
function saveAndRender() {
  save() // Save data to local storage
  render() // Re-render the UI
}

// Save data to local storage
function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists)) // Save lists
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId) // Save selected list ID
}

// Render the entire UI
function render() {
  clearElement(listsContainer) // Clear existing list elements
  renderLists() // Render all lists in the sidebar

  const selectedList = lists.find(list => list.id === selectedListId) // Find the selected list
  if (selectedListId == null) { // Check if no list is selected
    listDisplayContainer.style.display = 'none' // Hide the task display container
  } else {
    listDisplayContainer.style.display = '' // Show the task display container
    listTitleElement.innerText = selectedList.name // Set the selected list title
    renderTaskCount(selectedList) // Render the task count
    clearElement(tasksContainer) // Clear existing tasks
    renderTasks(selectedList) // Render tasks of the selected list
  }
}

// Render tasks for a specific list
function renderTasks(selectedList) {
  selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true) // Clone the task template
    const checkbox = taskElement.querySelector('input') // Get the checkbox element
    checkbox.id = task.id // Set the checkbox ID
    checkbox.checked = task.complete // Set the checkbox state
    const label = taskElement.querySelector('label') // Get the label element
    label.htmlFor = task.id // Set the label to reference the checkbox
    label.append(task.name) // Set the task name
    tasksContainer.appendChild(taskElement) // Add the task to the container
  })
}

// Render the task count for a specific list
function renderTaskCount(selectedList) {
  const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length // Count incomplete tasks
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks" // Singular/plural formatting
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining` // Display task count
}

// Render all lists in the sidebar
function renderLists() {
  lists.forEach(list => {
    const listElement = document.createElement('li') // Create a new list element
    listElement.dataset.listId = list.id // Set the list ID as a dataset
    listElement.classList.add("list-name") // Add styling class
    listElement.innerText = list.name // Set the list name
    if (list.id === selectedListId) { // Check if this is the selected list
      listElement.classList.add('active-list') // Highlight the selected list
    }
    listsContainer.appendChild(listElement) // Add the list to the container
  })
}

// Clear all child elements from a container
function clearElement(element) {
  while (element.firstChild) { // While the container has child elements
    element.removeChild(element.firstChild) // Remove the first child
  }
}

// Initial render on page load
render()
