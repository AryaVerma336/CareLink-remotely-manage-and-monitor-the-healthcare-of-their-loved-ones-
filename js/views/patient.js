/* Patient Dashboard View Renderer */
function render_patient_dashboard() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Next Appointment</div>
        <div class="stat-icon">📅</div>
        <div class="stat-val">24 Feb</div>
        <div class="stat-sub">Dr. Verma at 11:00 AM</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Medicines Due</div>
        <div class="stat-icon">💊</div>
        <div class="stat-val">2</div>
        <div class="stat-sub">After Lunch (2:00 PM)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Medicine Delivery</div>
        <div class="stat-icon">📦</div>
        <div class="stat-val">Out</div>
        <div class="stat-sub">ETA: 30 mins</div>
      </div>
      <div class="stat-card" style="background:var(--red-dim);border-color:rgba(255,79,109,0.3);cursor:pointer" onclick="showToast('🚨 EMERGENCY SOS ALERT TRIGGERED! Family & Ambulance notified!','danger')">
        <div class="stat-label" style="color:var(--red)">Emergency SOS</div>
        <div class="stat-icon">🆘</div>
        <div class="stat-val" style="color:var(--red)">PRESS</div>
        <div class="stat-sub" style="color:var(--red)">1-Tap Alert</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">Today's Medication Schedule</span></div>
      <div class="panel-body">
        <div class="pill-grid">
          <div class="pill-slot taken">
            <div class="pill-ic">✅</div>
            <div class="pill-time">8:00 AM</div>
            <div class="pill-nm">Amlodipine 5mg</div>
          </div>
          <div class="pill-slot upcoming">
            <div class="pill-ic">⏰</div>
            <div class="pill-time">2:00 PM</div>
            <div class="pill-nm">Metformin 500mg</div>
          </div>
          <div class="pill-slot upcoming">
            <div class="pill-ic">⏰</div>
            <div class="pill-time">9:00 PM</div>
            <div class="pill-nm">Atorvastatin 10mg</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
