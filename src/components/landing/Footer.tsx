export const Footer = () => {
  return (
    <footer className="bg-white border-gray-200 border-t">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="flex justify-center items-center bg-indigo-600 rounded-lg w-8 h-8">
                <span className="font-bold text-white">A</span>
              </div>
              <span className="ml-2 font-bold text-gray-900 text-xl">AnalyseDB</span>
            </div>
            <p className="mt-4 max-w-md text-gray-600 text-base">
              Transform your database into an actionable insights engine. Empower teams to uncover growth opportunities without technical complexity.
            </p>
            <div className="mt-4">
              <p className="text-gray-500 text-sm">
                Support: <a href="mailto:support@analyse.db" className="text-indigo-600 hover:text-indigo-700">support@analyse.db</a>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-4 mt-4">
              <li>
                <a href="#features" className="text-gray-600 hover:text-gray-900 text-base">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-base">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#security" className="text-gray-600 hover:text-gray-900 text-base">
                  Security
                </a>
              </li>
              <li>
                <a href="#roadmap" className="text-gray-600 hover:text-gray-900 text-base">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-4 mt-4">
              <li>
                <a href="/about" className="text-gray-600 hover:text-gray-900 text-base">
                  About
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-base">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-gray-900 text-base">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-gray-200 border-t">
          <p className="text-gray-500 text-base text-center">
            &copy; {new Date().getFullYear()} AnalyseDB. All rights reserved.
          </p>

          {/* <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
              </svg>
              <span>25+ SQL/NoSQL variants supported</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4M7.835 4.697a11.95 11.95 0 0 1 8.813.493.75.75 0 0 1-.528 1.4 10.45 10.45 0 0 0-7.71-.43L8 6.2V9h3.75a.75.75 0 0 1 0 1.5H7A.75.75 0 0 1 6.25 9V5.814a.75.75 0 0 1 1.585-.117Z"/>
              </svg>
              <span>Prebuilt ETL templates</span>
            </div>
          </div> */}
        </div>
      </div>
    </footer>
  );
};
