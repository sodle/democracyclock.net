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

const lastQuoteDate = "2025-01-17";

export interface Env {
  FOOL_API_KEY: string;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/stonks.json") {
      const response = await fetch(
        `https://api.fool.com/quotes/v4/historical/charts/220472?timeFrame=YTD&precision=Day&apikey=${env.FOOL_API_KEY}`
      );
      const responseJson: FoolResponse = await response.json();
      const chartBars = responseJson.ChartBars;

      const startingQuote = chartBars.find(
        (b) => b.PricingDate === lastQuoteDate
      );
      const latestQuote = chartBars[chartBars.length - 1];

      return Response.json({ startingQuote, latestQuote });
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
