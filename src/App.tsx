import { useState } from "react";
import "./App.css";
import { useInterval } from "usehooks-ts";

function pluralize(value: number, unit: string) {
  if (value == 1) {
    return `${value} ${unit}`;
  }
  return `${value.toLocaleString()} ${unit}s`;
}

function Countdown(props: { endDate: Date }) {
  const end = props.endDate.getTime();

  function calc() {
    return Math.floor((end - Date.now()) / 1000);
  }

  const [diff, setDiff] = useState(calc());

  function breakdown(time: number): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const days = Math.floor(time / 24 / 60 / 60);
    time -= days * 24 * 60 * 60;

    const hours = Math.floor(time / 60 / 60);
    time -= hours * 60 * 60;

    const minutes = Math.floor(time / 60);
    time -= minutes * 60;

    const seconds = time;

    return { days, hours, minutes, seconds };
  }

  useInterval(() => {
    setDiff(calc());
  }, 500);

  const b = breakdown(diff);
  return (
    <div>
      <p>
        <strong>{pluralize(b.days, "day")}, </strong>
        {pluralize(b.hours, "hour")}, {pluralize(b.minutes, "minute")},{" "}
        {pluralize(b.seconds, "second")}
      </p>
    </div>
  );
}

const midtermsDate = new Date("2026-11-03T09:00:00-05:00");
const electionDate = new Date("2028-11-07T09:00:00-05:00");
const inaugurationDate = new Date("2029-01-20T09:00:00-05:00");

function App() {
  return (
    <>
      <h1>Countdown to the end of Trump 2</h1>
      <div>
        <h2>The 2026 Midterms are in</h2>
        <Countdown endDate={midtermsDate} />
        <p>({midtermsDate.toDateString()})</p>
      </div>
      <div>
        <h2>The 2028 Presidential Election is in</h2>
        <Countdown endDate={electionDate} />
        <p>({electionDate.toDateString()})</p>
      </div>
      <div>
        <h2>The next President will be inaugurated in</h2>
        <Countdown endDate={inaugurationDate} />
        <p>({inaugurationDate.toDateString()})</p>
      </div>
    </>
  );
}

export default App;
