/* Driver Dashboard & Transport View Renderer */
function render_driver_dashboard() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Assigned Trips</div>
        <div class="stat-icon">🗺️</div>
        <div class="stat-val" data-target="2">2</div>
        <div class="stat-sub">1 active now</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Trips Completed Today</div>
        <div class="stat-icon">✅</div>
        <div class="stat-val" data-target="6">6</div>
        <div class="stat-sub">100% on-time rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Driver Rating</div>
        <div class="stat-icon">⭐</div>
        <div class="stat-val">4.95</div>
        <div class="stat-sub">124 verified reviews</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Today's Earnings</div>
        <div class="stat-icon">💰</div>
        <div class="stat-val">₹1,850</div>
        <div class="stat-sub">Direct deposit</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Active Pickup Trip (TRIP #201)</span>
        <span class="tag tag-teal">In Transit</span>
      </div>
      <div class="panel-body">
        <div class="trip-card">
          <div class="trip-header">
            <div>
              <div style="font-weight:700;color:var(--text);font-size:16px">Ramesh Sharma (Patient)</div>
              <div style="font-size:12px;color:var(--text3)">Phone: +91 98123 45678</div>
            </div>
            <button class="btn btn-success btn-sm" onclick="showToast('Marking trip as completed...','success')">Mark Completed</button>
          </div>
          <div class="trip-route">
            <div class="route-point"><span class="dot" style="background:var(--amber)"></span> Pickup: <strong>12/45 Gomti Nagar, Lucknow</strong></div>
            <div class="route-point"><span class="dot" style="background:var(--red)"></span> Drop: <strong>King George Hospital, Chowk, Lucknow</strong></div>
          </div>
        </div>
      </div>
    </div>
  `;
}
