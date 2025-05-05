export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">AnalyseDB</span>
            </div>
            <p className="mt-4 text-base text-gray-600 max-w-md">
              Transform your database into an actionable insights engine. Empower teams to uncover growth opportunities without technical complexity.
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Support: support@analysedb.com
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#features" className="text-base text-gray-600 hover:text-gray-900">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-base text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#security" className="text-base text-gray-600 hover:text-gray-900">
                  Security
                </a>
              </li>
              <li>
                <a href="#roadmap" className="text-base text-gray-600 hover:text-gray-900">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="/about" className="text-base text-gray-600 hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-base text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-base text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-500 text-center">
            &copy; {new Date().getFullYear()} AnalyseDB. All rights reserved.
          </p>

          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center text-gray-500 text-sm space-x-2">
              <svg 
                className="h-5 w-5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
              </svg>
              <span>25+ SQL/NoSQL variants supported</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm space-x-2">
              <svg 
                className="h-5 w-5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4M7.835 4.697a11.95 11.95 0 0 1 8.813.493.75.75 0 0 1-.528 1.4 10.45 10.45 0 0 0-7.71-.43L8 6.2V9h3.75a.75.75 0 0 1 0 1.5H7A.75.75 0 0 1 6.25 9V5.814a.75.75 0 0 1 1.585-.117Z"/>
              </svg>
              <span>Prebuilt ETL templates</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
