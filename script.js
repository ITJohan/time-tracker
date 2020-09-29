const taskSelector = document.getElementById('task-selector')
const newTaskInput = document.getElementById('new-task-input')
const addBtn = document.getElementById('add-task-btn')
const startBtn = document.getElementById('start-btn')
const timer = document.getElementById('timer')

let time = 0
let timerActive = false
let timerRef = null
const pomodoroInterval = 55 * 60
let pomodoroTimer = pomodoroInterval
let pomodoroRef = null
let tasks = []

const selectorInit = () => {
  const tasksStr = localStorage.getItem('time-tracker')
  if (tasksStr) {
    const fetchedTasks = JSON.parse(tasksStr)
    tasks = [...fetchedTasks]
    tasks.forEach((task, index) => {
      const option = document.createElement('option')
      option.value = task.name
      option.innerText = task.name
      taskSelector.add(option)
      
      if (index === 0) {
        // display time
        time = task.time
        timer.innerText = secondsToTimeStr(task.time)
      }
    })
  }
}

const secondsToTimeStr = seconds => {
  const hours = Math.floor(seconds / 3600)
  let secondsLeft = seconds - hours * 3600
  const minutes = Math.floor(secondsLeft / 60)
  secondsLeft = secondsLeft - minutes * 60 
  return `${digitFormater(hours)}:${digitFormater(minutes)}:${digitFormater(secondsLeft)}`
}

const digitFormater = digit => {
  return digit < 10 ? '0' + digit : digit
}


// event listeners
addBtn.addEventListener('click', () => {
  // get task
  const task = newTaskInput.value
  if (task === '') return

  // add selector value
  const option = document.createElement('option')
  option.value = task
  option.innerText = task
  taskSelector.add(option) 
  newTaskInput.value = ''

  // add to storage
  const tasksStr = localStorage.getItem('time-tracker')
  if (tasksStr) {
    const fetchedTasks = JSON.parse(tasksStr)    
    tasks = [...fetchedTasks, {name: task, time: 0}]
    localStorage.setItem('time-tracker', JSON.stringify(tasks))
  } else {
    tasks = [{name: task, time: 0}]
    localStorage.setItem('time-tracker', JSON.stringify(tasks))
  }
})

startBtn.addEventListener('click', () => {
  if (timerActive) {
    clearInterval(timerRef)
    clearInterval(pomodoroRef)
    startBtn.innerText = 'Start'
    timerActive = false

    // add to storage
    const tasksStr = localStorage.getItem('time-tracker')
    const fetchedTasks = JSON.parse(tasksStr)    
    tasks = fetchedTasks.map(task => (
      task.name === taskSelector.value ? 
        {name: taskSelector.value, time} :
        task
    ))
    localStorage.setItem('time-tracker', JSON.stringify(tasks))
  } else {
    // get task
    const selectedTask = taskSelector.value
    if (!selectedTask) return

    const task = tasks.find(task => task.name === selectedTask)
    time = task.time

    // start timer
    timerRef = setInterval(() => {
      const timeStr = secondsToTimeStr(time)
      const pomodoroStr = secondsToTimeStr(pomodoroTimer)
      timer.innerText = timeStr
      time++
      pomodoroTimer--
      if (pomodoroTimer === 0) {
        new Notification('Pomodoro done!')
        pomodoroTimer = pomodoroInterval
      }
      document.title = pomodoroStr
    }, 1000)
    startBtn.innerText = 'Stop'

    timerActive = true
  }
})

taskSelector.addEventListener('change', () => {
  const task = tasks.find(task => task.name === taskSelector.value)
  time = task.time
  const timeStr = secondsToTimeStr(time)
  timer.innerText = timeStr
  document.title = timeStr
})

if (Notification.permission === 'default') {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
  } else {
    Notification.requestPermission()
      .then(permission => {
        Notification.permission = permission
      })
  }
}

selectorInit()