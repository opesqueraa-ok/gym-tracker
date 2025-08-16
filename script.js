// Gym Tracker — Simple
// Almacena sesiones en localStorage. Exporta a CSV.
// Incluye botón "Tomar fecha de hoy" para setear datetime-local sin escribir.

const $ = (s) => document.querySelector(s);
const tableBody = $("#sessionTable tbody");
let currentSession = { dt: "", items: [] };

// ----- Utilidades
function pad(n){ return String(n).padStart(2,'0'); }
function toInputDateTimeLocal(date){ // -> "YYYY-MM-DDTHH:MM"
  const y = date.getFullYear();
  const m = pad(date.getMonth()+1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function fromInputDateTimeLocal(str){
  // str esperado: "YYYY-MM-DDTHH:MM"
  if(!str) return null;
  // Crear fecha en local time
  const [ymd, hm] = str.split("T");
  const [y, m, d] = ymd.split("-").map(Number);
  const [H, M] = hm.split(":").map(Number);
  return new Date(y, m-1, d, H, M, 0, 0);
}

function loadHistory(){
  const raw = localStorage.getItem("gym_history_v1");
  return raw ? JSON.parse(raw) : [];
}

function saveHistory(arr){
  localStorage.setItem("gym_history_v1", JSON.stringify(arr));
}

function renderSession(){
  tableBody.innerHTML = "";
  currentSession.items.forEach((it, idx) => {
    const tr = document.createElement("tr");
    const tdIdx = document.createElement("td");
    const tdName = document.createElement("td");
    const tdType = document.createElement("td");
    const tdDetail = document.createElement("td");
    const tdDel = document.createElement("td");

    tdIdx.textContent = idx+1;
    tdName.textContent = it.name;
    tdType.innerHTML = `<span class="badge">${it.type === "reps" ? "Reps" : "Tiempo"}</span>`;
    tdDetail.textContent = it.detail;

    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.title = "Eliminar";
    btn.addEventListener("click", () => {
      currentSession.items.splice(idx,1);
      renderSession();
    });
    tdDel.appendChild(btn);

    tr.appendChild(tdIdx);
    tr.appendChild(tdName);
    tr.appendChild(tdType);
    tr.appendChild(tdDetail);
    tr.appendChild(tdDel);
    tableBody.appendChild(tr);
  });
}

function renderHistory(){
  const historyDiv = $("#history");
  const history = loadHistory();
  historyDiv.innerHTML = "";
  if(history.length === 0){
    historyDiv.innerHTML = '<p class="small">No hay sesiones guardadas aún.</p>';
    return;
  }

  history.slice().reverse().forEach((sess) => {
    const container = document.createElement("div");
    container.className = "history-item";

    const title = document.createElement("div");
    title.className = "history-title";

    const date = fromInputDateTimeLocal(sess.dt);
    const nice = date ? date.toLocaleString() : "(sin fecha)";
    const left = document.createElement("div");
    left.innerHTML = `<strong>${nice}</strong> <span class="small">(${sess.items.length} ejercicios)</span>`;

    const btn = document.createElement("button");
    btn.textContent = "Exportar CSV";
    btn.className = "secondary";
    btn.addEventListener("click", () => exportCSV([sess], `sesion_${sess.dt.replace(/[:T]/g,'-')}.csv`));

    title.appendChild(left);
    title.appendChild(btn);

    const table = document.createElement("table");
    table.className = "history-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>#</th><th>Ejercicio</th><th>Tipo</th><th>Detalle</th>
        </tr>
      </thead>
      <tbody>
        ${sess.items.map((it,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${it.name}</td>
            <td>${it.type === "reps" ? "Reps" : "Tiempo"}</td>
            <td>${it.detail}</td>
          </tr>`).join("")}
      </tbody>
    `;

    container.appendChild(title);
    container.appendChild(table);
    historyDiv.appendChild(container);
  });
}

function csvEscape(s){
  if(s == null) return "";
  const str = String(s);
  if(/[",\n]/.test(str)){
    return `"${str.replace(/"/g,'""')}"`;
  }
  return str;
}

function exportCSV(sessions, filename="historial_gym.csv"){
  const rows = [["Fecha","Ejercicio","Tipo","Detalle"]];
  sessions.forEach(sess => {
    const date = fromInputDateTimeLocal(sess.dt);
    const dateStr = date ? date.toLocaleString() : "";
    sess.items.forEach(it => {
      rows.push([dateStr, it.name, it.type === "reps" ? "Reps" : "Tiempo", it.detail]);
    });
  });
  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ----- Eventos UI
$("#exType").addEventListener("change", (e)=>{
  const v = e.target.value;
  $("#rowReps").style.display = (v === "reps") ? "" : "none";
  $("#rowTime").style.display = (v === "time") ? "" : "none";
});

$("#btnNow").addEventListener("click", ()=>{
  const now = new Date();
  $("#sessionDate").value = toInputDateTimeLocal(now); // Local time
  currentSession.dt = $("#sessionDate").value;
});

$("#btnNewSession").addEventListener("click", ()=>{
  currentSession = { dt: "", items: [] };
  $("#sessionDate").value = "";
  renderSession();
});

$("#btnSaveSession").addEventListener("click", ()=>{
  const dtVal = $("#sessionDate").value;
  if(!dtVal){
    alert("Primero coloca la fecha/hora (puedes usar 'Tomar fecha de hoy').");
    return;
  }
  if(currentSession.items.length === 0){
    alert("Agrega al menos un ejercicio antes de guardar.");
    return;
  }
  currentSession.dt = dtVal;
  const history = loadHistory();
  history.push(currentSession);
  saveHistory(history);
  renderHistory();
  // preparar nueva sesión
  currentSession = { dt: "", items: [] };
  $("#sessionDate").value = "";
  renderSession();
  alert("Sesión guardada ✅");
});

$("#btnAdd").addEventListener("click", ()=>{
  const name = $("#exName").value.trim();
  const type = $("#exType").value;
  const reps = $("#exReps").value.trim();
  const timeDetail = $("#exTime").value.trim();
  if(!name){
    alert("Escribe un nombre para el ejercicio.");
    return;
  }
  const detail = (type === "reps") ? reps : timeDetail;
  if(!detail){
    alert("Agrega el detalle (reps o tiempo/distancia).");
    return;
  }
  currentSession.items.push({ name, type, detail });
  renderSession();
  $("#exName").value = "";
  $("#exReps").value = "";
  $("#exTime").value = "";
});

$("#btnClear").addEventListener("click", ()=>{
  $("#exName").value = "";
  $("#exReps").value = "";
  $("#exTime").value = "";
});

$("#btnExportCurrent").addEventListener("click", ()=>{
  if(!currentSession.items.length){
    alert("No hay ejercicios en la sesión actual.");
    return;
  }
  const sess = { dt: $("#sessionDate").value || toInputDateTimeLocal(new Date()), items: currentSession.items };
  exportCSV([sess], "sesion_actual.csv");
});

$("#btnExportAll").addEventListener("click", ()=>{
  const history = loadHistory();
  if(history.length === 0){
    alert("No hay historial aún.");
    return;
  }
  exportCSV(history, "historial_gym.csv");
});

$("#btnClearHistory").addEventListener("click", ()=>{
  if(confirm("¿Borrar TODO el historial? Esta acción no se puede deshacer.")){
    saveHistory([]);
    renderHistory();
  }
});

// ----- Init
(function init(){
  // Setear fecha/hora sugerida a "ahora"
  $("#sessionDate").value = toInputDateTimeLocal(new Date());
  currentSession.dt = $("#sessionDate").value;
  renderSession();
  renderHistory();
})();
