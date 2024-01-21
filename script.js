
const storagePrefix = 'to-do-list_'
const timeList = document.querySelector(".time-list")
const timeBanner = document.querySelector(".timemap .banner .row")

let timeListStart = 6
let timeListScroll = parseInt(localStorage.getItem(storagePrefix + "timeListScroll")) || 0


function stopPropagation(event) {
  event.stopPropagation()
}

function updateTimeBanner() {
  const position = timeListScroll * 21
  timeBanner.style.transform = `translateY(${-position}px)`
}

function updateTimeList() {
  let content = ""
  for (let i = 0; i < 24; i++) {
    const number = (i + timeListScroll + timeListStart) % 24
    const time = (number < 10 ? "0" : "") + number + ":00"
    const division = (number) % 6 === 0 ? " style='border-top: 1px solid var(--primary-color);'" : ""
    content += `<div${division}>${time}</div>`
  }
  timeList.innerHTML = content
}

function scrollTimeList(direction) {
  timeListScroll += direction > 0 ? 1 : -1

  if (timeListScroll < 0) timeListScroll = 23
  else if (timeListScroll >= 24) timeListScroll = 0
  updateTimeBanner()
  updateTimeList()

  localStorage.setItem(storagePrefix + "timeListScroll", timeListScroll)
}

document.addEventListener("DOMContentLoaded", function() {
  updateTimeBanner()
  updateTimeList()
})





const sessionsEl = document.querySelector(".sessions")
const addSessionModal = document.querySelector(".add-session-modal")
const addSessionForm = document.querySelector(".add-session-form")

let sessions = JSON.parse(localStorage.getItem(storagePrefix + "sessions")) || []

function totalSessionDuration() {
  return sessions.reduce((accumulator, session) => accumulator + session.duration, 0)
}

function updateSessionsEl() {
  sessionsEl.innerHTML = ""
  sessions.forEach((item) => {
    sessionsEl.innerHTML += `
    <div class="session" style="height: calc(21px * ${item.duration});" onclick="selectTaskPanel('${item.taskPanelId}')">
      <div class="header">
        ${item.icon ? `<img src="${item.icon}" class="icon" />` : ""}
        <p class="title text-truncate">${item.title}</p>
      </div>
      <div class="actions" onclick="stopPropagation(event)">
        <button onclick="addSessionDuration('${item.id}',1)"><i class="bi bi-plus"></i></button>
        <button onclick="addSessionDuration('${item.id}',-1)"><i class="bi bi-dash"></i></button>
        <button onclick="deleteSession('${item.id}')"><i class="bi bi-trash-fill"></i></button>
      </div>
    </div>
  `
  })
}

function addSession(icon, title, duration) {
  const id = crypto.randomUUID()
  const taskPanelId = crypto.randomUUID()

  if (totalSessionDuration() + duration > 24) {
    const remainingDuration = 24 - totalSessionDuration()
    if (remainingDuration >= 2) duration = remainingDuration
    else return
  }
  
  sessions.push({id, taskPanelId: taskPanelId, icon, title, duration})
  updateSessionsEl()
  saveSessions()

  createTaskPanel(taskPanelId, icon, title)
}

function addSessionDuration(id, amount) {
  const session = sessions.find((item) => item.id === id)
  
  if (amount >= 0 && (totalSessionDuration() + amount > 24)) return
  else if (session.duration + amount < 2) return
  
  session.duration += amount
  
  updateSessionsEl()
  saveSessions()
}

function deleteSession(id) {
  const taskPanelId = sessions.find(item => item.id === id).taskPanelId
  deleteTaskPanel(taskPanelId)

  const sessionIndex = sessions.findIndex(session => session.id === id)
  sessions.splice(sessionIndex, 1)

  updateSessionsEl()
  saveSessions()
}

function saveSessions() {
  localStorage.setItem(storagePrefix + "sessions", JSON.stringify(sessions))
}


function openAddSessionModal() {
  addSessionModal.classList.toggle("hidden")
}

addSessionForm.addEventListener("submit", async function(event) {
  event.preventDefault()

  const form = addSessionForm
  const file = form.elements["file"].files[0]
  const title = form.elements["title"].value
  const duration = parseInt(form.elements["duration"].value)
  
  try {
    const fileUrl = file ? await readFile(file) : null
    
    addSession(fileUrl, title, duration)

    form.reset()
    openAddSessionModal()
  } catch (error) {
    console.error(error)
  }
})


function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };

    reader.onerror = function (error) {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}


document.addEventListener("DOMContentLoaded", function() {
  updateSessionsEl()
})




let taskPanels = JSON.parse(localStorage.getItem(storagePrefix + "taskPanels")) || []

let selectedTaskPanel = 0

const taskPanelEl = document.querySelector(".task-panel")

let taskToDelete = null

function createTaskPanel(id, icon, title) {
  const newTaskPanel = {
    id: id,
    icon: icon,
    title: title,
    tasks: []
  }

  taskPanels.push(newTaskPanel)

  saveTaskPanels()

  selectTaskPanel(id)
}

function deleteTaskPanel(id) {
  taskPanels.splice(taskPanels.findIndex(item => item.id === id), 1)

  updateTaskPanelEl()

  saveTaskPanels()
}

function saveTaskPanels() {
  localStorage.setItem(storagePrefix + "taskPanels", JSON.stringify(taskPanels))
}

function updateTaskPanelEl() {
  const taskPanel = taskPanels[selectedTaskPanel]
  if (!taskPanel) {
    taskPanelEl.innerHTML = ""
    taskPanelEl.classList.add("hidden")
    return
  }
  taskPanelEl.classList.remove("hidden")

  taskPanelEl.innerHTML = `
    <div class="header">
      ${taskPanel.icon ? `<img src="${taskPanel.icon}">` : ""}
      <p class="title text-truncate">${taskPanel.title}</p>
    </div>

    <form class="add-task" onsubmit="addTask(event)">
      <input type="text" name="title" placeholder="Add new task">
      <button>Add</button>
    </form>

    <div class="tasks">        
      ${taskPanel.tasks.map((task, i) => `
        <label class="task"${task.isDone ? " style='text-decoration: line-through;'" : ""}>
          ${task.title}
          <div class="actions">
            <input type="checkbox"${task.isDone ? " checked" : ""} oninput="doneTask('${task.id}')">
            <button>
              <i class="bi bi-folder"></i>
            </button>
            <button onclick="deleteTask('${task.id}')">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </label>
      `).join("")}
    </div>
  `
}


function addTask(event) {
  event.preventDefault()
  
  const newTask = {
    id: crypto.randomUUID(),
    title: event.target.elements["title"].value,
    isDone: false
  }

  if (!newTask.title) return
  
  taskPanels[selectedTaskPanel].tasks.push(newTask)

  updateTaskPanelEl()

  saveTaskPanels()
}

function selectTaskPanel(id) {
  selectedTaskPanel = taskPanels.findIndex(item => item.id === id)
  updateTaskPanelEl()
}

function doneTask(id) {
  const task = taskPanels[selectedTaskPanel].tasks.find(item => item.id === id)
  task.isDone = !task.isDone

  updateTaskPanelEl()
  saveTaskPanels()
}

function deleteTask(id) {
  if (taskToDelete !== id) {
    taskToDelete = id
    return
  }

  const tasks = taskPanels[selectedTaskPanel].tasks
  const taskIndex = tasks.findIndex(item => item.id === id)

  tasks.splice(taskIndex, 1)

  updateTaskPanelEl()
  saveTaskPanels()
}

document.addEventListener("DOMContentLoaded", function() {
  updateTaskPanelEl()
})








