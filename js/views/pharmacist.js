/* Pharmacist Dashboard & Expiry Tracker View Renderer */
function render_pharmacist_dashboard() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Inventory Items</div>
        <div class="stat-icon">💊</div>
        <div class="stat-val" data-target="1420">1420</div>
        <div class="stat-sub">Across 85 categories</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Orders</div>
        <div class="stat-icon">🛒</div>
        <div class="stat-val" data-target="5">5</div>
        <div class="stat-sub">2 ready for dispatch</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">30-Day Expiry Risk</div>
        <div class="stat-icon">⏰</div>
        <div class="stat-val" style="color:var(--red)">3</div>
        <div class="stat-sub">Action required</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Low Stock Alerts</div>
        <div class="stat-icon">⚠️</div>
        <div class="stat-val" style="color:var(--amber)">2</div>
        <div class="stat-sub">Quantity < 20</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Medicine Expiry & Batch Tracker (30/60/90-Day Radar)</span>
      </div>
      <div class="panel-body" style="padding:0">
        <table class="table">
          <thead><tr><th>Medicine Name</th><th>Batch No</th><th>Stock</th><th>Expiry Date</th><th>Risk Level</th></tr></thead>
          <tbody>
            <tr><td><div class="name">Metformin 500mg (Glycomet)</div></td><td>B24018</td><td>85</td><td>In 18 Days</td><td><span class="tag tag-red">Critical (30 Days)</span></td></tr>
            <tr><td><div class="name">Atorvastatin 10mg (Lipivas)</div></td><td>B24045</td><td>12</td><td>In 45 Days</td><td><span class="tag tag-amber">Warning (60 Days)</span></td></tr>
            <tr><td><div class="name">Telmisartan 40mg (Telma)</div></td><td>B24075</td><td>70</td><td>In 75 Days</td><td><span class="tag tag-purple">Watch (90 Days)</span></td></tr>
            <tr><td><div class="name">Amlodipine 5mg (Amlosafe)</div></td><td>B24091</td><td>140</td><td>In 240 Days</td><td><span class="tag tag-green">Safe</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
