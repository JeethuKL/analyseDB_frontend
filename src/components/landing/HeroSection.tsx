import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div className="lg:col-span-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-8">
              Turn Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                Database
              </span>{" "}
              Into Actionable{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-600">
                Insights
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10">
              Transform your database into an actionable insights engine. Empower sales, marketing, 
              and product teams to uncover growth opportunities without technical complexity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Start Free Analysis
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Watch Demo
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>GDPR Ready</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1 mt-12 lg:mt-0">
            <div className="relative">
              <div className="absolute -inset-4">
                <div className="w-full h-full mx-auto opacity-30 blur-lg filter bg-gradient-to-r from-indigo-400 to-violet-400" />
              </div>
              <div className="relative rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden border border-gray-200">
                {/* Animated Dashboard Preview */}
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="h-48 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
