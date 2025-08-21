// backend/utils/dateUtils.js
function toISODate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${dd.length===2?mm:mm}${'-'}${dd}`;
  }
  
  function addDays(isoDate, n) {
    const d = new Date(isoDate);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  
  function minutesToHHMM(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  
  module.exports = { toISODate, addDays, minutesToHHMM };
  