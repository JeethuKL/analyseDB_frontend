import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="z-0 absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />

      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="lg:items-center lg:gap-8 lg:grid lg:grid-cols-2 lg:text-left text-center">
          <div className="lg:col-span-1">
            <h1 className="mb-8 font-bold text-gray-900 text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              Turn Your{" "}
              <span className="bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 text-transparent">
                Database
              </span>{" "}
              Into Actionable{" "}
              <span className="bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-600 text-transparent">
                Insights
              </span>
            </h1>

            <p className="mb-10 text-gray-600 text-xl">
              Transform your database into an actionable insights engine. Empower sales, marketing, 
              and product teams to uncover growth opportunities without technical complexity.
            </p>

            <div className="flex sm:flex-row flex-col justify-center lg:justify-start gap-4">
              <Link
                href="/signup"
                className="inline-flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 px-8 py-3 border border-transparent rounded-lg font-medium text-white text-base transition-colors"
              >
                Start Free Analysis
              </Link>
              {/* <button className="inline-flex justify-center items-center bg-white hover:bg-gray-50 px-8 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 text-base transition-colors">
                Watch Demo
              </button> */}
            </div>

            {/* <div className="flex justify-center lg:justify-start items-center space-x-6 mt-8 text-gray-600 text-sm">
              <div className="flex items-center">
                <svg className="mr-2 w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>GDPR Ready</span>
              </div>
            </div> */}
          </div>

          <div className="hidden lg:block lg:col-span-1 mt-12 lg:mt-0">
            <div className="relative">
              <div className="absolute -inset-4">
                <div className="bg-gradient-to-r from-indigo-400 to-violet-400 opacity-30 blur-lg mx-auto w-full h-full filter" />
              </div>
              <div className="relative bg-white/80 shadow-xl backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden">
                {/* Animated Dashboard Preview */}
                <div className="p-6">
                  <div className="space-y-4 animate-pulse">
                    <div className="bg-gray-200 rounded w-3/4 h-4" />
                    <div className="space-y-3">
                      <div className="bg-gray-200 rounded h-4" />
                      <div className="bg-gray-200 rounded w-5/6 h-4" />
                    </div>
                    <div className="bg-gradient-to-r from-indigo-100 to-violet-100 rounded-lg h-48" />
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
