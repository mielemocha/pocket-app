const scheduleForm = document.getElementById('schedule-form');
const scheduleTitleInput = document.getElementById('schedule-title');
const scheduleMemoInput = document.getElementById('schedule-memo');
const scheduleList = document.getElementById('schedule-list');

let schedules = []; // とりあえずメモリ上に持つ

scheduleForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = scheduleTitleInput.value.trim();
  const memo = scheduleMemoInput.value.trim();

  if (!title) return;

  const schedule = {
    id: Date.now(),
    title,
    memo,
    status: 'scheduled',
  };

  schedules.push(schedule);
  renderSchedules();

  scheduleTitleInput.value = '';
  scheduleMemoInput.value = '';
});

function renderSchedules() {
  scheduleList.innerHTML = '';

  schedules.forEach((schedule) => {
    const li = document.createElement('li');
    li.textContent = schedule.title;
    scheduleList.appendChild(li);
  });
}
