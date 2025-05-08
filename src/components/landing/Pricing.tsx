"use client";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useRouter } from 'next/navigation'


interface Tier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  isAvailable?: boolean;
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
      "Supports only Postgres",
    ],
    cta: "Start Free",
    highlighted: true,
    isAvailable: true,
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
      "Supports only Postgres",
    ],
    cta: "Get Started",
    highlighted: false,
    isAvailable: false,
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
      "Supports all databases",
    ],
    cta: "Go Pro",
    highlighted: false,
    isAvailable: false,
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
      "Supports all databases",
    ],
    cta: "Contact Us",
    highlighted: false,
    isAvailable: false,
  },
];

export const Pricing = () => {
  const router = useRouter();

  const handleTierClick = (tier: Tier) => {
    if (tier.isAvailable) {
      router.push("/signup");
    }
  };

  return (
    <section className="bg-gray-50 py-24" id="pricing">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-gray-900 text-3xl sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg">
            Start for free, upgrade as you grow. All plans include core
            analytics features.
          </p>
        </div>

        <div className="gap-6 lg:gap-8 grid grid-cols-1 lg:grid-cols-4">
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
                <span className="-top-4 left-1/2 absolute bg-indigo-600 px-4 py-1 rounded-full font-medium text-white text-sm -translate-x-1/2">
                  Most Popular
                </span>
              )}
              {!tier.isAvailable && (
                <span className="top-4 right-4 absolute bg-yellow-100 px-2.5 py-0.5 rounded-full font-medium text-yellow-800 text-xs">
                  Coming Soon
                </span>
              )}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {tier.name}
                </h3>
                <div className="flex items-baseline mt-4">
                  <span className="font-bold text-gray-900 text-4xl tracking-tight">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="ml-1 text-gray-500">{tier.period}</span>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon
                      className="flex-shrink-0 w-6 h-6 text-green-500"
                      aria-hidden="true"
                    />
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleTierClick(tier)}
                disabled={!tier.isAvailable}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? tier.isAvailable
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-indigo-300 text-white cursor-not-allowed"
                    : tier.isAvailable
                    ? "bg-gray-50 text-indigo-600 hover:bg-gray-100"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h3 className="mb-4 font-semibold text-gray-900 text-xl">
            Enterprise
          </h3>
          <p className="mb-6 text-gray-600">
            Custom solutions for large teams and specific needs
          </p>
          <a href="mailto:sales@analyse.db" className="inline-flex items-center bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold text-white text-lg transition-colors">
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
};
