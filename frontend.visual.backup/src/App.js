import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:4000';

function App() {

  const [status, setStatus] = useState(null);
  const [operators, setOperators] = useState([]);
  const [ledger, setLedger] = useState([]);

  async function loadData() {

    try {

      const s =
        await axios.get(
          `${API}/api/status`
        );

      const o =
        await axios.get(
          `${API}/api/operators`
        );

      const l =
        await axios.get(
          `${API}/api/ledger`
        );

      setStatus(s.data);
      setOperators(o.data);
      setLedger(l.data);

    } catch (err) {

      console.log(err.message);

    }
  }

  useEffect(() => {

    loadData();

    const timer =
      setInterval(loadData, 10000);

    return () => clearInterval(timer);

  }, []);

  return (

    <div className="app">

      <aside className="sidebar">

        <div className="logo">

          <span className="red">[</span>

          BL

          <span className="lock">
            🔐
          </span>

          X

          <span className="red">]</span>

          <span className="gold">
            •SL0TS
          </span>

        </div>

        <p>
          Secure Crypto Operations Network
        </p>

        <nav>

          <a href="#dashboard">
            Dashboard
          </a>

          <a href="#operators">
            Operators
          </a>

          <a href="#ledger">
            Ledger
          </a>

          <a href="#security">
            Security
          </a>

        </nav>

      </aside>

      <main className="main">

        <section className="hero">

          <div>

            <h1>
              COYOTE’Z NETWORK COMMAND
            </h1>

            <p>
              Mining operations,
              wallet telemetry,
              secured storage,
              and PostgreSQL-backed
              ledger infrastructure.
            </p>

          </div>

          <span className="online-pill">
            ● NETWORK ONLINE
          </span>

        </section>

        <section
          className="cards"
          id="dashboard"
        >

          <div className="card">

            <small>Platform</small>

            <strong>
              {status?.platform ||
                '[BL🔐X]•SL0TS'}
            </strong>

          </div>

          <div className="card">

            <small>Database</small>

            <strong>
              {status?.database ||
                'POSTGRESQL'}
            </strong>

          </div>

          <div className="card">

            <small>Operators</small>

            <strong>
              {status?.operators || 0}
            </strong>

          </div>

          <div className="card">

            <small>Ledger Records</small>

            <strong>
              {status?.ledgerRecords || 0}
            </strong>

          </div>

        </section>

        <section className="panel">

          <h2>
            [BL🔐X]•CHAIN Network
          </h2>

          <div className="globe">
            🌐
          </div>

        </section>

        <section className="grid">

          <div
            className="panel"
            id="operators"
          >

            <h2>Operators</h2>

            <table>

              <thead>

                <tr>

                  <th>Name</th>
                  <th>Wallet</th>
                  <th>Wallet BLX</th>
                  <th>Vault BLX</th>
                  <th>Mined</th>

                </tr>

              </thead>

              <tbody>

                {operators.map((op) => (

                  <tr key={op.id}>

                    <td>{op.name}</td>

                    <td>
                      {op.wallet_id}
                    </td>

                    <td>
                      {Number(
                        op.wallet_balance
                      ).toFixed(4)}
                    </td>

                    <td>
                      {Number(
                        op.vault_balance
                      ).toFixed(4)}
                    </td>

                    <td>
                      {Number(
                        op.mined_total
                      ).toFixed(4)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div
            className="panel"
            id="ledger"
          >

            <h2>Live Ledger</h2>

            <table>

              <thead>

                <tr>

                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {ledger
                  .slice(0, 10)
                  .map((tx) => (

                  <tr key={tx.id}>

                    <td>{tx.type}</td>

                    <td>
                      {Number(
                        tx.amount
                      ).toFixed(4)} BLX
                    </td>

                    <td>
                      {tx.status}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        <section
          className="panel"
          id="security"
        >

          <h2>
            Cyber Security Center
          </h2>

          <div className="security">

            <div>
              Threat Scan: CLEAR
            </div>

            <div>
              Ledger Integrity: ACTIVE
            </div>

            <div>
              Operator Verification:
              ACTIVE
            </div>

            <div>
              Database Layer:
              POSTGRESQL
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;
