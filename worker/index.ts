type FoolResponse = {
  ChartBars: ChartBar[];
};

type ChartBar = {
  PricingDate: string;
  Close: Quote;
};

type Quote = {
  Amount: number;
};

type CurrencyRates = {
  USD: number;
};

type CurrencyResponse = {
  rates: CurrencyRates;
};

export interface Env {
  FOOL_API_KEY: string;
  EXRATE_API_KEY: string;
  DB: D1Database;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/stonks.json") {
      const startingQuote: ChartBar = {
        PricingDate: "2025-01-17",
        Close: { Amount: 5996.66 },
      };
      const now = new Date();

      const result = await env.DB.prepare(
        "SELECT * FROM StonkQuotes ORDER BY timestamp DESC LIMIT 1"
      ).first();

      if (result !== null) {
        const timestamp = result["timestamp"] as number;
        const age = now.getTime() - timestamp;

        if (age < 18 * 60 * 60 * 1000) {
          const latestQuote: ChartBar = {
            PricingDate: `${now.getFullYear()}-${
              now.getMonth() + 1
            }-${now.getDate()}`,
            Close: { Amount: result["sp500"] as number },
          };

          return Response.json({ startingQuote, latestQuote });
        }
      }

      const response = await fetch(
        `https://api.fool.com/quotes/v4/historical/charts/220472?timeFrame=YTD&precision=Day&apikey=${env.FOOL_API_KEY}`
      );
      const responseJson: FoolResponse = await response.json();
      const chartBars = responseJson.ChartBars;
      const latestQuote = chartBars[chartBars.length - 1];

      await env.DB.prepare(
        "INSERT INTO StonkQuotes (timestamp, sp500) VALUES (?, ?)"
      )
        .bind(now.getTime(), latestQuote.Close.Amount)
        .run();

      return Response.json({ startingQuote, latestQuote });
    }
    if (url.pathname === "/api/dollar.json") {
      const usdStart = 1 / 1.027707;
      const now = new Date();

      const result = await env.DB.prepare(
        "SELECT * FROM CurrencyQuotes ORDER BY timestamp DESC LIMIT 1"
      ).first();

      if (result !== null) {
        const timestamp = result["timestamp"] as number;
        const age = now.getTime() - timestamp;

        if (age < 18 * 60 * 60 * 1000) {
          const usdLatest = result["usdToEur"] as number;
          return Response.json({ usdStart, usdLatest, timestamp });
        }
      }

      const response = await fetch(
        `https://api.exchangeratesapi.io/v1/latest?access_key=${env.EXRATE_API_KEY}&base=EUR&symbols=USD`
      );
      const responseJson: CurrencyResponse = await response.json();
      const usdLatest = 1 / responseJson.rates.USD;

      await env.DB.prepare(
        "INSERT INTO CurrencyQuotes (timestamp, usdToEur) VALUES (?, ?)"
      )
        .bind(now.getTime(), usdLatest)
        .run();

      return Response.json({ usdStart, usdLatest, timestamp: now.getTime() });
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
