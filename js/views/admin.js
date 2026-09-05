/* Admin Dashboard View Renderer */
function render_admin_dashboard() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Platform Users</div>
        <div class="stat-icon">👥</div>
        <div class="stat-val" data-target="1540">1540</div>
        <div class="stat-sub">+12% this month</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Approved Hospitals</div>
        <div class="stat-icon">🏥</div>
        <div class="stat-val" data-target="120">120</div>
        <div class="stat-sub">Across 15 cities</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Approvals</div>
        <div class="stat-icon">✅</div>
        <div class="stat-val" style="color:var(--amber)" data-target="7">7</div>
        <div class="stat-sub">Hospitals & Pharmacies</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active SOS Alerts</div>
        <div class="stat-icon">🆘</div>
        <div class="stat-val" style="color:var(--red)">1</div>
        <div class="stat-sub">Location Lucknow</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">Pending Partner Approvals</span></div>
      <div class="panel-body" style="padding:0">
        <table class="table">
          <thead><tr><th>Entity Name</th><th>Type</th><th>City</th><th>Submitted On</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><div class="name">Max Super Specialty Hospital</div></td><td>Hospital</td><td>Lucknow</td><td>04 Sep 2026</td><td><button class="btn btn-success btn-sm" onclick="showToast('Entity Approved!','success')">Approve</button></td></tr>
            <tr><td><div class="name">Sanjivani Chemist</div></td><td>Pharmacy</td><td>Chennai</td><td>03 Sep 2026</td><td><button class="btn btn-success btn-sm" onclick="showToast('Entity Approved!','success')">Approve</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
