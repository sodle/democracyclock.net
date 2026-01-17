type CurrencyRates = {
  USD: number;
};

type CurrencyResponse = {
  rates: CurrencyRates;
};

export interface Env {
  EXRATE_API_KEY: string;
  DB: D1Database;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
