const { useState, useEffect } = React;

function getRatesByUsername(rates) {
  return rates.reduce((acc, curr) => {
    if (!acc[curr.username]) {
      acc[curr.username] = [];
    }

    acc[curr.username].push({ ...curr });

    return acc;
  }, {});
}

function App() {
  const [rates, setRates] = useState(null);
  const [view, setView] = useState("individual-rates");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/rates");
        const json = await response.json();
        setRates(getRatesByUsername(json.data));
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, []);

  function updateView(event) {
    const { value } = event.target;
    setView(value);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ margin: "12px" }}>View</span>
        <select onChange={updateView}>
          <option value="individual-rates">Individual Rates</option>
          {/*<option value="multiple-rates">Multiple Rates</option>*/}
        </select>
      </div>
      {view === "individual-rates" && <HashUserRates rates={rates} />}
      {view === "multiple-rates" && <MultipleRates rates={rates} />}
    </div>
  );
}

function HashUserRates({ rates }) {
  const [index, setIndex] = useState(0);

  function updateIndex(event) {
    const { value } = event.target;
    setIndex(value);
  }

  const userRates = rates ? Object.values(rates)[index] : [];
  const showRates = userRates.length > 0;

  if (!showRates) return <div />;

  return (
    <div>
      <table
        className="charts-css line show-heading"
        style={{ height: "200px", maxWidth: "90%" }}
      >
        <caption>Hash rates</caption>
        <tbody>
          {userRates.map((rate, i) => {
            const first = i === 0;

            let start = "0.0";

            if (!first) {
              const value = Number.parseFloat(
                userRates[i - 1]["cha/day"].replace(",", "")
              );

              start = value / 2000;
            }

            const value =
              Number.parseFloat(rate["cha/day"].replace(",", "")) / 2000;

            return (
              <tr key={rate.date}>
                <td
                  style={{
                    "--start": start,
                    "--size": value,
                  }}
                >
                  {/*<span className="data">{rate["cha/day"]}</span>*/}
                  <span className="tooltip">
                    {rate["cha/day"]} / Date: {rate.date}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        style={{ display: "flex", justifyContent: "center", margin: "12px" }}
      >
        <select onChange={updateIndex}>
          {Object.keys(rates).map((username, i) => (
            <option key={username} value={i}>
              {username}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function MultipleRates({ rates }) {
  const multipleRates = rates ? Object.values(rates) : [];

  const showRates = multipleRates.length > 0;

  if (!showRates) return <div />;

  return (
    <table class="charts-css line multiple">
      <tbody>
        {multipleRates.map((rates) => {
          return (
            <tr>
              <th scope="row"></th>
              {rates.map((rate, i) => {
                const first = i === 0;

                let start = "0.0";

                if (!first) {
                  const value = Number.parseFloat(
                    rates[i - 1]["cha/day"].replace(",", "")
                  );

                  start = value / 2000;
                }

                const value =
                  Number.parseFloat(rate["cha/day"].replace(",", "")) / 2000;
                return (
                  <td
                    style={{
                      "--start": start,
                      "--size": value,
                    }}
                  >
                    {/*<span className="data">{rate["cha/day"]}</span>*/}
                    <span className="tooltip">
                      {rate["cha/day"]} / Date: {rate.date}
                    </span>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const root = document.querySelector("#app");
ReactDOM.render(<App />, root);
