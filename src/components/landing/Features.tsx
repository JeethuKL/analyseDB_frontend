import { ChartBarIcon, UserGroupIcon, CogIcon } from "@heroicons/react/24/solid";

const features = [
  {
    title: "Business-Centric Analytics Engine",
    icon: ChartBarIcon,
    sections: [
      {
        name: "Sales Intelligence Module",
        features: [
          "Track deal pipeline health with auto-generated forecasts",
          "Identify high-value accounts through predictive scoring",
          "Monitor rep performance against quota metrics",
        ],
      },
      {
        name: "Marketing Insights Hub",
        features: [
          "Map customer journeys across touchpoints",
          "Calculate true campaign ROI with multi-touch attribution",
          "Segment audiences using behavioral patterns",
        ],
      },
      {
        name: "User Behavior Console",
        features: [
          "Visualize feature adoption curves",
          "Track retention cohorts across lifecycle stages",
          "Detect churn risks through machine learning signals",
        ],
      },
    ],
  },
  {
    title: "Zero-Configuration Analytics",
    icon: CogIcon,
    sections: [
      {
        name: "Auto-Discovery Engine",
        features: [
          "Instantly classifies tables into standardized business entities",
          "Detects relationships between orders, users, and events",
          "Generates ER diagrams with click-depth analysis",
        ],
      },
      {
        name: "Smart Data Preparation",
        features: [
          "Automatically handles timezone normalization",
          "Flags data quality issues in real-time",
          "Maintains historical versions for trend analysis",
        ],
      },
    ],
  },
  {
    title: "Real-Time Decision Support",
    icon: UserGroupIcon,
    sections: [
      {
        name: "Live Scenario Modeling",
        features: [
          '"What-if" analysis for pricing/promotion strategies',
          "Drag-and-drop forecast adjustments",
          "Impact projections across departments",
        ],
      },
      {
        name: "Collaborative Annotations",
        features: [
          "Tag-team analysis with @mentions",
          "Version-controlled insights repository",
          "Approval workflows for board-ready reports",
        ],
      },
      {
        name: "Compliance Guardrails",
        features: [
          "Field-level GDPR masking",
          "PII detection engine",
          "Audit trails for all data interactions",
        ],
      },
    ],
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your Data Into Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect your database and start discovering actionable insights in minutes, not months.
            No complex setup, no technical expertise required.
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feature, featureIdx) => (
            <div key={feature.title} className="relative">
              <div className="relative">
                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                  <div className="lg:col-span-1">
                    <div className="flex items-center">
                      <feature.icon className="h-12 w-12 text-indigo-600" />
                      <h3 className="ml-4 text-2xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-10 lg:mt-0 lg:col-span-2">
                    <div className="grid gap-8 lg:grid-cols-{feature.sections.length}">
                      {feature.sections.map((section) => (
                        <div key={section.name} className="relative">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            {section.name}
                          </h4>
                          <ul className="space-y-3">
                            {section.features.map((item) => (
                              <li key={item} className="flex items-start">
                                <div className="flex-shrink-0">
                                  <svg
                                    className="h-6 w-6 text-green-500"
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
                                <p className="ml-3 text-base text-gray-600">
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
