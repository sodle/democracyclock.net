import { useEffect, useState } from "react";
import "./App.css";
import { useInterval } from "usehooks-ts";

type DollarResponse = {
  usdStart: number;
  usdLatest: number;
  timestamp: number;
};

function pluralize(value: number, unit: string): string {
  if (value == 1) {
    return `${value} ${unit}`;
  }
  return `${value.toLocaleString()} ${unit}s`;
}

function useDollar(): [number?, number?, string?] {
  const [usdStart, setUsdStart] = useState<number | undefined>();
  const [usdLatest, setUsdLatest] = useState<number | undefined>();
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  useEffect(() => {
    fetch("/api/dollar.json")
      .then((r) => r.json())
      .then((r: DollarResponse) => {
        setUsdStart(r.usdStart);
        setUsdLatest(r.usdLatest);
        setLastUpdated(formatDate(r.timestamp));
      });
  }, []);

  useInterval(() => {
    fetch("/api/dollar.json")
      .then((r) => r.json())
      .then((r: DollarResponse) => {
        setUsdStart(r.usdStart);
        setUsdLatest(r.usdLatest);
        setLastUpdated(formatDate(r.timestamp));
      });
  }, 30 * 60 * 1000);

  return [usdStart, usdLatest, lastUpdated];
}

function DollarMeter() {
  const [startingQuote, latestQuote, lastUpdated] = useDollar();

  if (!(latestQuote && startingQuote)) {
    console.log("empty");
    return <h2>Loading...</h2>;
  }

  console.log("loaded");

  const diff = latestQuote - startingQuote;
  const percentage = Math.abs(diff / startingQuote) * 100;
  const percentStr = `${percentage.toFixed(2)}%`;

  return (
    <div className="col-md-6 border-bottom py-3">
      <h2>
        The US Dollar has{" "}
        {diff < 0 ? (
          <span style={{ color: "red" }}>fallen {percentStr}</span>
        ) : (
          <span style={{ color: "green" }}>risen {percentStr}</span>
        )}{" "}
        compared to the Euro.
      </h2>
      <p className="countdown-remaining">Last updated {lastUpdated}</p>
    </div>
  );
}

function Countdown(props: {
  header: string;
  endDate: Date;
  width: number;
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
    <div className={`col-md-${props.width} border-bottom py-3`}>
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
            >{Math.floor(progress)}%</div>
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
      {/* <div className="alert alert-danger" role="alert">
      </div> */}
      <h1>Countdown to the end of Trump 2</h1>
      <div className="container-fluid">
        <div className="row">
          <Countdown
            header="Trump's second term has lasted"
            endDate={worstDate}
            width={12}
            countUp
          />
        </div>
        <div className="row">
          <DollarMeter />
        </div>
        <div className="row">
          <Countdown
            header="The 2026 Midterms are in"
            endDate={midtermsDate}
            startDate={worstDate}
            width={12}
          />
        </div>
        <div className="row">
          <Countdown
            header="The 2028 Presidential Election is in"
            endDate={electionDate}
            startDate={worstDate}
            width={6}
          />
          <Countdown
            header="The next President will be inaugurated in"
            endDate={inaugurationDate}
            startDate={worstDate}
            width={6}
          />
        </div>
      </div>
      <p>
        <a href="https://github.com/sodle/democracyclock.net" target="_blank">
          Source Code
        </a>
      </p>
    </>
  );
}

export default App;
