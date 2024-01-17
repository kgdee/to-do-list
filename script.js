
const storagePrefix = 'to-do-list_'
const timeList = document.querySelector(".time-list")
const timeBanner = document.querySelector(".timemap .banner .row")

let timeListStart = 6
let timeListScroll = parseInt(localStorage.getItem(storagePrefix + "timeListScroll")) || 0


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

function scrollTimeList() {
  timeListScroll++
  if (timeListScroll >= 24) timeListScroll = 0
  updateTimeBanner()
  updateTimeList()

  localStorage.setItem(storagePrefix + "timeListScroll", timeListScroll)
}

document.addEventListener("DOMContentLoaded", function() {
  updateTimeBanner()
  updateTimeList()
})




const sessionsEl = document.querySelector(".sessions")

let sessions = [
  {
    id: '1',
    icon: `<i class="bi bi-brightness-alt-high-fill"></i>`,
    title: "Morning",
    duration: 5,
  },
  {
    id: '2',
    icon: `<i class="bi bi-sun"></i>`,
    title: "Afternoon",
    duration: 5,
  },
  {
    id: '3',
    icon: `<i class="bi bi-moon"></i>`,
    title: "Night",
    duration: 7,
  },
  {
    id: '4',
    icon: `<i class="bi bi-moon-stars-fill"></i>`,
    title: "Midnight",
    duration: 2,
  },
]

function totalSessionDuration() {
  return sessions.reduce((accumulator, session) => accumulator + session.duration, 0)
}

function updateSessionsEl() {
  sessionsEl.innerHTML = ""
  sessions.forEach((item) => {
    sessionsEl.innerHTML += `
    <div class="session" style="height: calc(21px * ${item.duration});">
      ${item.icon}
      ${item.title}
      <div class="actions">
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

  if (totalSessionDuration() + duration > 24) {
    const remainingDuration = 24 - totalSessionDuration()
    if (remainingDuration >= 2) duration = remainingDuration
    else return
  }
  
  sessions.push({id, icon, title, duration})
  updateSessionsEl()
}

function addSessionDuration(id, amount) {
  const session = sessions.find((item) => item.id === id)

  if (totalSessionDuration() + amount > 24) return
  
  session.duration += amount
  
  updateSessionsEl()
}

function deleteSession(id) {
  const sessionIndex = sessions.findIndex(session => session.id === id)
  sessions.splice(sessionIndex, 1)

  updateSessionsEl()
}


document.addEventListener("DOMContentLoaded", function() {
  updateSessionsEl()
})