import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:4000';

function App() {
  const [status, setStatus] = useState({});
  const [operators, setOperators] = useState([]);
  const [ledger, setLedger] = useState([]);

  async function loadData() {
    try {
      const s = await axios.get(`${API}/api/status`);
      const o = await axios.get(`${API}/api/operators`);
      const l = await axios.get(`${API}/api/ledger`);

      setStatus(s.data);
      setOperators(o.data);
      setLedger(l.data);
    } catch (err) {
      console.log(err.message);
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  const walletTotal = operators.reduce(
    (sum, op) => sum + Number(op.wallet_balance || 0),
    0
  );

  const vaultTotal = operators.reduce(
    (sum, op) => sum + Number(op.vault_balance || 0),
    0
  );

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
          <div className="metric">
            <span>Database</span>
            <strong>{status.database || 'POSTGRESQL'}</strong>
          </div>

          <div className="metric">
            <span>Operators</span>
            <strong>{status.operators || operators.length}</strong>
          </div>

          <div className="metric">
            <span>Ledger Records</span>
            <strong>{status.ledgerRecords || ledger.length}</strong>
          </div>

          <div className="metric">
            <span>System Status</span>
            <strong>{status.status || 'ONLINE'}</strong>
          </div>
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
              <strong>{walletTotal.toFixed(4)} BLX</strong>
              <p>Live wallet holdings from PostgreSQL.</p>
            </div>

            <div className="panel">
              <h3>Coyote’z Bank Safe</h3>
              <strong>{vaultTotal.toFixed(4)} BLX</strong>
              <p>Secured vault storage from database records.</p>
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
            <h3>Operators</h3>
            <ul className="ledger">
              {operators.slice(0, 6).map((op) => (
                <li key={op.id}>
                  {op.name || 'Operator'}
                  <b>{Number(op.wallet_balance || 0).toFixed(4)} BLX</b>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h3>Live Ledger</h3>
            <ul className="ledger">
              {ledger.slice(0, 6).map((tx) => (
                <li key={tx.id}>
                  {tx.type}
                  <b>{Number(tx.amount || 0).toFixed(4)}</b>
                </li>
              ))}
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
