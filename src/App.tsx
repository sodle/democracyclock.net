import { useState } from "react";
import "./App.css";
import { useInterval } from "usehooks-ts";

function pluralize(value: number, unit: string) {
  if (value == 1) {
    return `${value} ${unit}`;
  }
  return `${value.toLocaleString()} ${unit}s`;
}

function Countdown(props: {
  endDate: Date;
  countUp?: boolean;
  startDate?: Date;
}) {
  const end = props.endDate.getTime();
  const start = props.startDate ? props.startDate.getTime() : 0;
  const duration = end - start;

  function calc() {
    if (props.countUp) {
      return Math.floor((Date.now() - end) / 1000);
    }
    return Math.floor((end - Date.now()) / 1000);
  }

  function calcProgress() {
    if (props.startDate && !props.countUp) {
      return ((Date.now() - start) / duration) * 100;
    }
    return 0;
  }

  const [diff, setDiff] = useState(calc());
  const [progress, setProgress] = useState(calcProgress());

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
    setProgress(calcProgress());
  }, 500);

  const b = breakdown(diff);
  return (
    <div>
      <p className="countdown-relative">{pluralize(b.days, "day")}</p>
      <p className="countdown-relative-sm">
        {pluralize(b.hours, "hour")}, {pluralize(b.minutes, "minute")},{" "}
        {pluralize(b.seconds, "second")}
      </p>
      {props.startDate ? (
        <>
          <div
            className="progress"
            role="progressbar"
            aria-label="Basic example"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </>
      ) : null}
      <p className="countdown-end">({props.endDate.toDateString()})</p>
    </div>
  );
}

const worstDate = new Date("2025-01-20T09:00:00-05:00");

const midtermsDate = new Date("2026-11-03T09:00:00-05:00");
const electionDate = new Date("2028-11-07T09:00:00-05:00");
const inaugurationDate = new Date("2029-01-20T09:00:00-05:00");

function App() {
  return (
    <>
      <h1>Countdown to the end of Trump 2</h1>
      <div>
        <h2>Trump's second term has lasted</h2>
        <Countdown endDate={worstDate} countUp />
      </div>
      <hr />
      <div>
        <h2>The 2026 Midterms are in</h2>
        <Countdown endDate={midtermsDate} startDate={worstDate} />
      </div>
      <hr />
      <div>
        <h2>The 2028 Presidential Election is in</h2>
        <Countdown endDate={electionDate} startDate={worstDate} />
      </div>
      <hr />
      <div>
        <h2>The next President will be inaugurated in</h2>
        <Countdown endDate={inaugurationDate} startDate={worstDate} />
      </div>
      <hr />
      <p>
        <a href="https://github.com/sodle/democracyclock.net" target="_blank">
          Source Code
        </a>
      </p>
    </>
  );
}

export default App;
