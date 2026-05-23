import React from 'react';
import './App.css';

function App() {
  return (
    <div className="ops-shell">
      <aside className="ops-sidebar">
        <div className="brand-logo">
          <span className="purple">B</span>
          <span className="purple">L</span>
          <span className="red">🔐</span>
          <span className="purple">X</span>
          <span className="red">SL0TS</span>
          <span className="red">🔑</span>
        </div>

        <div className="brand-sub">COYOTE’Z NETWORK</div>

        <button className="nav-active">Command Center</button>
        <button>Mining Operations</button>
        <button>Runner’z Wallet</button>
        <button>Coyote’z Bank</button>
        <button>Transfer Network</button>
        <button>Cyber Security</button>
        <button className="support">Special Ops Support</button>
      </aside>

      <main className="ops-main">
        <section className="top-grid">
          <div className="metric"><span>Total Network Value</span><strong>$2.45B</strong></div>
          <div className="metric"><span>Active Operators</span><strong>26,381</strong></div>
          <div className="metric"><span>Mining Yield</span><strong>947.82 BLX</strong></div>
          <div className="metric"><span>Security Matrix</span><strong>99.98%</strong></div>
        </section>

        <section className="command-grid">
          <div className="map-card">
            <div className="section-head">
              <h1>GLOBAL MINING NETWORK</h1>
              <span>LIVE NODE MAP</span>
            </div>

            <div className="map">
              <div className="grid-lines"></div>
              <div className="continent c1"></div>
              <div className="continent c2"></div>
              <div className="continent c3"></div>
              <div className="node n1"></div>
              <div className="node n2"></div>
              <div className="node n3"></div>
              <div className="node n4"></div>
              <div className="node n5"></div>
              <div className="route r1"></div>
              <div className="route r2"></div>
              <div className="route r3"></div>
            </div>
          </div>

          <div className="right-stack">
            <div className="panel red-panel">
              <h3>Runner’z Wallet</h3>
              <strong>2.457890 BTC</strong>
              <p>Secured wallet layer online</p>
            </div>

            <div className="panel">
              <h3>Coyote’z Bank Safe</h3>
              <strong>$2,458,310</strong>
              <p>Encrypted vault infrastructure</p>
            </div>

            <div className="panel green-panel">
              <h3>Special Ops Support</h3>
              <strong>ACTIVE</strong>
              <p>Contact support, recovery, security, and operator assistance.</p>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <h3>Mining Telemetry</h3>
            <div className="bars">
              <span style={{ height: '45%' }}></span>
              <span style={{ height: '65%' }}></span>
              <span style={{ height: '52%' }}></span>
              <span style={{ height: '80%' }}></span>
              <span style={{ height: '72%' }}></span>
              <span style={{ height: '90%' }}></span>
            </div>
          </div>

          <div className="panel">
            <h3>Live Ledger</h3>
            <ul className="ledger">
              <li>MINING_YIELD <b>CONFIRMED</b></li>
              <li>VAULT_DEPOSIT <b>RECORDED</b></li>
              <li>TRANSFER <b>MONITORED</b></li>
              <li>PASSIVE_YIELD <b>ACTIVE</b></li>
            </ul>
          </div>

          <div className="panel">
            <h3>Cyber Security</h3>
            <p>Threat Scan: CLEAR</p>
            <p>Ledger Integrity: ACTIVE</p>
            <p>Operator Verification: ONLINE</p>
            <p>Network Shield: ENABLED</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
