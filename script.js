let timer;
let timeLeft = 1500;
let currentMode = "focus";
let sessions = JSON.parse(localStorage.getItem("sessions")) || 2;
let focusMinutes = JSON.parse(localStorage.getItem("focusMinutes")) || 50;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [
  {id:1,name:"Study JS",deadline:"",priority:"High",done:false},
  {id:2,name:"Workout",deadline:"",priority:"Medium",done:true}
];

function updateDisplay(){
  const mins = Math.floor(timeLeft/60);
  const secs = timeLeft%60;
  document.getElementById("timerDisplay").innerText =
    `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
}

function setMode(mode){
  currentMode = mode;
  if(mode==="focus"){ timeLeft=1500; document.getElementById("progressBar").style.background="#e74c3c"; }
  if(mode==="short"){ timeLeft=300; document.getElementById("progressBar").style.background="#2ecc71"; }
  if(mode==="long"){ timeLeft=900; document.getElementById("progressBar").style.background="#27ae60"; }
  updateDisplay();
}

function startTimer(){
  timer=setInterval(()=>{
    timeLeft--;
    updateDisplay();
    updateProgress();

    if(timeLeft<=0){
      clearInterval(timer);
      alert("Session Complete!");
      if(currentMode==="focus"){
        sessions++;
        focusMinutes+=25;
        localStorage.setItem("sessions",sessions);
        localStorage.setItem("focusMinutes",focusMinutes);
      }
      updateReports();
    }
  },1000);
}

function pauseTimer(){ clearInterval(timer); }

function resetTimer(){
  pauseTimer();
  setMode(currentMode);
}

function updateProgress(){
  const total = currentMode==="focus"?1500:(currentMode==="short"?300:900);
  const percent = ((total-timeLeft)/total)*100;
  document.getElementById("progressBar").style.width=percent+"%";
}

document.getElementById("taskForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const name=document.getElementById("taskName").value;
  const deadline=document.getElementById("taskDeadline").value;
  const priority=document.getElementById("taskPriority").value;

  tasks.push({id:Date.now(),name,deadline,priority,done:false});
  localStorage.setItem("tasks",JSON.stringify(tasks));
  renderTasks();
  e.target.reset();
});

function renderTasks(){
  const list=document.getElementById("taskList");
  list.innerHTML="";
  tasks.forEach(task=>{
    const li=document.createElement("li");
    li.className=task.done?"completed":"";
    li.innerHTML=`
      <span>${task.name} (${task.priority})</span>
      <div>
        <button onclick="toggleTask(${task.id})">✔</button>
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.getElementById("taskCompletedCount").innerText =
    tasks.filter(t=>t.done).length;
}

function toggleTask(id){
  tasks=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);
  localStorage.setItem("tasks",JSON.stringify(tasks));
  renderTasks();
}

function deleteTask(id){
  tasks=tasks.filter(t=>t.id!==id);
  localStorage.setItem("tasks",JSON.stringify(tasks));
  renderTasks();
}

function updateReports(){
  document.getElementById("sessionCount").innerText=sessions;
  document.getElementById("focusTime").innerText=focusMinutes;

  const ctx=document.getElementById("reportChart").getContext("2d");
  ctx.clearRect(0,0,300,150);

  ctx.fillStyle="#e74c3c";
  ctx.fillRect(10,150-focusMinutes,50,focusMinutes);

  ctx.fillStyle="#2ecc71";
  ctx.fillRect(100,150-sessions*5,50,sessions*5);
}

document.getElementById("highContrastToggle").onclick=()=>{
  document.body.classList.toggle("high-contrast");
};

updateDisplay();
renderTasks();
updateReports();
