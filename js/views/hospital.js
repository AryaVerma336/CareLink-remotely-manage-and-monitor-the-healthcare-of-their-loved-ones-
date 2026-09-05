/* Hospital Dashboard View Renderer */
function render_hospital_dashboard() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Doctors</div>
        <div class="stat-icon">👨‍⚕️</div>
        <div class="stat-val" data-target="45">45</div>
        <div class="stat-sub">32 active today</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Appointments Today</div>
        <div class="stat-icon">📅</div>
        <div class="stat-val" data-target="28">28</div>
        <div class="stat-sub">4 pending confirmation</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Online Consultations</div>
        <div class="stat-icon">💻</div>
        <div class="stat-val" data-target="12">12</div>
        <div class="stat-sub">3 scheduled after 3 PM</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Hospital Rating</div>
        <div class="stat-icon">⭐</div>
        <div class="stat-val">4.9</div>
        <div class="stat-sub">Based on 1,240 reviews</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Doctor Management & Slots</span>
        <button class="btn btn-primary btn-sm" onclick="showToast('New Doctor Modal Opened','info')">+ Add Doctor</button>
      </div>
      <div class="panel-body" style="padding:0">
        <table class="table">
          <thead><tr><th>Doctor Name</th><th>Specialization</th><th>Experience</th><th>Available Slots</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td><div class="name">Dr. V. K. Verma</div></td><td>Cardiology</td><td>18 Years</td><td>09:00 AM, 11:00 AM, 02:00 PM</td><td><span class="tag tag-green">Active</span></td></tr>
            <tr><td><div class="name">Dr. Sunita Mehta</div></td><td>Orthopedics</td><td>14 Years</td><td>10:00 AM, 01:00 PM, 04:00 PM</td><td><span class="tag tag-green">Active</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
