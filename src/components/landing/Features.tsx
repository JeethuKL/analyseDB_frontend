import { ChartBarIcon, UserGroupIcon, CogIcon, ChatBubbleBottomCenterTextIcon, CircleStackIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/solid";

const features = [
  {
    title: "Natural Language Data Explorer",
    icon: ChatBubbleBottomCenterTextIcon, // Or a custom NLP icon
    sections: [
      {
        name: "Conversational Analytics",
        features: [
          "Ask questions like *'Show monthly sales by region'* → get SQL & charts instantly",
          "Follow-up queries with contextual memory (e.g., *'Now filter by active customers'*)",
          "Auto-suggest improved phrasing for complex queries",
        ],
      },
      {
        name: "Multi-LLM Intelligence",
        features: [
          "Switch between Gemini, OpenAI, or Claude for optimized results",
          "Compare outputs from different LLMs side-by-side",
          "Fine-tune prompts for your database schema",
        ],
      },
    ],
  },
  {
    title: "Live Data Visualization Studio",
    icon: CircleStackIcon, // Or a dynamic chart icon
    sections: [
      {
        name: "Smart Chart Builder",
        features: [
          "Auto-recommend chart types based on query results (bar, line, scatter, etc.)",
          "One-click save to dashboards with refresh scheduling",
          "Embed live charts in Notion, Slack, or websites",
        ],
      },
      {
        name: "Real-Time Sync",
        features: [
          "Pro/Premium: Dashboards update automatically when data changes",
          "Set thresholds for alerts (e.g., *'Notify if sales drop >10%'*)",
          "Compare snapshots across time periods",
        ],
      },
    ],
  },
  {
    title: "Database Governance",
    icon: ShieldCheckIcon,
    sections: [
      {
        name: "Secure Connections",
        features: [
          "Read-only mode by default (no accidental writes)",
          "Row-level security for sensitive data",
          "Audit logs for all query activity",
        ],
      },
      {
        name: "Schema Intelligence",
        features: [
          "Auto-detect table relationships (PK/FK)",
          "Flag deprecated or duplicate fields",
          "Generate ER diagrams from live connections",
        ],
      },
    ],
  },
  {
    title: "Collaboration Hub",
    icon: UsersIcon,
    sections: [
      {
        name: "Shared Insights",
        features: [
          "Comment on charts/queries with @mentions",
          "Version history for saved analyses",
          "Export to PDF/CSV with branding options",
        ],
      },
      {
        name: "Enterprise Ready",
        features: [
          "Premium: White-label dashboards with custom CSS/JS",
          "SAML/SSO integration",
          "Dedicated instance for air-gapped deployments",
        ],
      },
    ],
  },
];

export const Features = () => {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-20 text-center">
          <h2 className="mb-4 font-bold text-gray-900 text-4xl">
            Transform Your Data Into Insights
          </h2>
          <p className="mx-auto max-w-3xl text-gray-600 text-lg">
            Connect your database and start discovering actionable insights in minutes, not months.
            No complex setup, no technical expertise required.
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feature, featureIdx) => (
            <div key={feature.title} className="relative">
              <div className="relative">
                <div className="lg:gap-8 lg:grid lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <div className="flex items-center">
                      <feature.icon className="w-12 h-12 text-indigo-600" />
                      <h3 className="ml-4 font-bold text-gray-900 text-2xl">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <div className="lg:col-span-2 mt-10 lg:mt-0">
                    <div className="grid gap-8 lg:grid-cols-{feature.sections.length}">
                      {feature.sections.map((section) => (
                        <div key={section.name} className="relative">
                          <h4 className="mb-4 font-semibold text-gray-900 text-lg">
                            {section.name}
                          </h4>
                          <ul className="space-y-3">
                            {section.features.map((item) => (
                              <li key={item} className="flex items-start">
                                <div className="flex-shrink-0">
                                  <svg
                                    className="w-6 h-6 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <p className="ml-3 text-gray-600 text-base">
                                  {item}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
