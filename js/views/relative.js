/* Patient Relative Dashboard View Renderer */
function render_relative_dashboard() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Active Appointments</div>
        <div class="stat-icon">📅</div>
        <div class="stat-val" data-target="3">3</div>
        <div class="stat-sub">2 upcoming this week</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Medicine Orders</div>
        <div class="stat-icon">💊</div>
        <div class="stat-val" data-target="7">7</div>
        <div class="stat-sub">1 out for delivery</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Pickup</div>
        <div class="stat-icon">🚗</div>
        <div class="stat-val" data-target="1">1</div>
        <div class="stat-sub">Driver assigned</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Consultations</div>
        <div class="stat-icon">💻</div>
        <div class="stat-val" data-target="2">2</div>
        <div class="stat-sub">Next: Today 4 PM</div>
      </div>
    </div>

    <div class="alert alert-warn mb-20">
      <span class="alert-icon">⚠️</span>
      <div class="alert-body">
        <div class="alert-title">Appointment in 2 days</div>
        <div class="alert-sub">Dr. Verma · Cardiology · KG Hospital, Lucknow</div>
      </div>
      <button class="btn btn-warning btn-sm" onclick="navigate('pickup-drop')">Request Pickup</button>
    </div>

    <div class="two-col">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Recent Appointments</span>
          <button class="btn btn-ghost btn-sm" onclick="navigate('book-appointment')">+ Book New</button>
        </div>
        <div class="panel-body" style="padding:0">
          <table class="table">
            <thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td><div class="name">Dr. Verma</div><div style="font-size:11px;color:var(--text3)">Cardiology</div></td><td>24 Feb 2026</td><td><span class="tag tag-amber">Upcoming</span></td></tr>
              <tr><td><div class="name">Dr. Mehta</div><div style="font-size:11px;color:var(--text3)">Orthopedics</div></td><td>18 Feb 2026</td><td><span class="tag tag-green">Completed</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Live Pickup Tracking</span><span class="tag tag-teal">● Live</span></div>
        <div class="panel-body">
          <div class="map-container">
            <div class="map-grid"></div>
            <div class="map-route"></div>
            <div class="map-dot hospital"></div>
            <div class="map-dot driver"></div>
            <div class="map-dot home"></div>
            <div class="map-info">
              <div class="map-eta">Driver: <strong>Suresh Kumar</strong> (UP 32 EV 9876)</div>
              <button class="btn btn-primary btn-sm" onclick="showToast('Calling driver...','info')">Call Driver</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
