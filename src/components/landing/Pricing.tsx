import { CheckIcon } from "@heroicons/react/24/solid";

interface Tier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "Free",
    features: [
      "One database connection",
      "Use your GEMINI API key",
      "Save charts",
      "Limited context",
      "Community support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Hobby",
    price: "$7",
    period: "/year",
    features: [
      "Up to 3 database connections",
      "Use Gemini/OpenAI/Claude",
      "Save charts",
      "Limited context",
      "1 hour support per month",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$18",
    period: "/year",
    features: [
      "Up to 5 database connections",
      "Use any AI model + built-in API keys",
      "Real-time data fetching",
      "Live dashboard updates",
      "2 hours support per month",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$30",
    period: "/year",
    features: [
      "Up to 10 database connections",
      "All AI models + built-in API keys",
      "1M context limit",
      "Fully customizable dashboard",
      "4 hours support per month",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export const Pricing = () => {
  return (
    <section className="py-24 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start for free, upgrade as you grow. All plans include core analytics features.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl bg-white p-8 shadow-sm flex flex-col ${
                tier.highlighted
                  ? "ring-2 ring-indigo-600"
                  : "ring-1 ring-gray-200"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              )}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-gray-500 ml-1">{tier.period}</span>
                  )}
                </div>
              </div>

              <ul className="mb-8 space-y-4 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      aria-hidden="true"
                    />
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-50 text-indigo-600 hover:bg-gray-100"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise</h3>
          <p className="text-gray-600 mb-6">
            Custom solutions for large teams and specific needs
          </p>
          <button className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
};
