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
  header: string;
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
    weeksIsh: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    if (props.countUp) {
      time++;
    }

    const days = Math.floor(time / 24 / 60 / 60);
    time -= days * 24 * 60 * 60;

    const weeksIsh = Math.floor(days / 7);

    const hours = Math.floor(time / 60 / 60);
    time -= hours * 60 * 60;

    const minutes = Math.floor(time / 60);
    time -= minutes * 60;

    const seconds = time;

    return { weeksIsh, days, hours, minutes, seconds };
  }

  useInterval(() => {
    setDiff(calc());
    setProgress(calcProgress());
  }, 500);

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const b = breakdown(diff);
  return (
    <div>
      <h2>
        {props.header}{" "}
        <span className="text-primary">{pluralize(b.weeksIsh, "week")}</span>.
      </h2>
      <p className="countdown-end">
        {weekdays[props.endDate.getDay()]}, {months[props.endDate.getMonth()]}{" "}
        {props.endDate.getDate()}, {props.endDate.getFullYear()}
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
              className="progress-bar progress-bar-striped progress-bar-animated"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </>
      ) : null}
      <p className="countdown-remaining">
        {pluralize(b.days, "day")}, {pluralize(b.hours, "hour")},{" "}
        {pluralize(b.minutes, "minute")}, {pluralize(b.seconds, "second")}
      </p>
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
      <hr />
      <div>
        <Countdown
          header="Trump's second term has lasted"
          endDate={worstDate}
          countUp
        />
      </div>
      <hr />
      <div>
        <Countdown
          header="The 2026 Midterms are in"
          endDate={midtermsDate}
          startDate={worstDate}
        />
      </div>
      <hr />
      <div>
        <Countdown
          header="The 2028 Presidential Election is in"
          endDate={electionDate}
          startDate={worstDate}
        />
      </div>
      <hr />
      <div>
        <Countdown
          header="The next President will be inaugurated in"
          endDate={inaugurationDate}
          startDate={worstDate}
        />
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
