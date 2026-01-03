import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white font-display overflow-x-hidden antialiased">
      {/* Navigation */}
      <div className="sticky top-0 z-50 w-full border-b border-[#e7ebf3] dark:border-[#2a3447] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3 text-[#0d121b] dark:text-white">
            <div className="flex items-center justify-center rounded bg-primary/10 p-1.5 text-primary">
              <span className="material-symbols-outlined !text-[24px]">group_work</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Dayflow</h2>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-[#0d121b] hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors" href="#">Product</a>
            <a className="text-sm font-medium text-[#0d121b] hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors" href="#">Solutions</a>
            <a className="text-sm font-medium text-[#0d121b] hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors" href="#">Pricing</a>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold text-[#0d121b] hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 transition-colors">
              Sign In
            </Link>
            <button className="flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-colors">
              Request Demo
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full bg-background-light dark:bg-background-dark">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"></div>
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-400/5"></div>
        
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          {/* Content */}
          <div className="flex flex-1 flex-col gap-6 text-left lg:max-w-xl">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-primary dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              New: AI-Powered Talent Analytics
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#0d121b] dark:text-white sm:text-5xl lg:text-6xl">
              Empower Your <span className="text-primary">Workforce</span> with Intelligent HR
            </h1>
            <p className="text-lg font-normal leading-relaxed text-[#4c669a] dark:text-gray-400">
              Streamline operations, enhance employee experience, and drive growth with Dayflow’s all-in-one enterprise HRMS. Trusted by forward-thinking companies worldwide.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button 
                onClick={() => navigate('/login')}
                className="flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:shadow-blue-500/30 transition-all"
              >
                Request a Demo
              </button>
              <button className="flex h-12 min-w-[160px] items-center justify-center rounded-lg border border-[#e7ebf3] bg-white px-6 text-base font-bold text-[#0d121b] hover:bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white dark:hover:bg-gray-800 transition-all">
                <span className="material-symbols-outlined mr-2 !text-lg">play_circle</span>
                Watch Video
              </button>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-gray-500 mt-2">
              No credit card required. 14-day free trial for teams.
            </p>
          </div>
          
          {/* Hero Image */}
          <div className="flex-1 lg:h-auto w-full">
            <div 
              className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group" 
              data-alt="Abstract dashboard UI showing employee stats and graphs" 
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBk4V85iQNsub15SdWhbDBQhSG_oVyMeMVAgapVO2m0HMQC6UJuHp3RVPUGDrAkiE8RQjbH0Wxb-Yk2QHeOQoMGpzbQbqB7uEjc_RWO8Qbp5QZoJ2wVmcUYGXw8G8GlsePPg_ZuLZM2BjYlB3aW_Yw59vTYx7g2HxF-GCJvzz62uQm5_5YJTG183yQZIat3LgNBbZ4dadtuu_wPYMfLtduOQgBvAsfRHK3Q2xWIbPuF7u72K4SJXBBTYiPidpeLl51_h0dZWtw0sw')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              {/* Floating Badge Example */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-xl border border-white/20 shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Payroll Processed Successfully</p>
                    <p className="text-xs text-gray-500">Just now • 450 Employees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full border-y border-[#e7ebf3] bg-surface-light dark:bg-surface-dark dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
              <p className="text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white">30%</p>
              <p className="text-sm font-medium text-[#4c669a] dark:text-gray-400">Time saved on payroll</p>
            </div>
            <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
              <p className="text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white">99.9%</p>
              <p className="text-sm font-medium text-[#4c669a] dark:text-gray-400">System uptime guarantee</p>
            </div>
            <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
              <p className="text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white">500+</p>
              <p className="text-sm font-medium text-[#4c669a] dark:text-gray-400">Enterprise clients</p>
            </div>
            <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
              <p className="text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white">24/7</p>
              <p className="text-sm font-medium text-[#4c669a] dark:text-gray-400">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-background-light dark:bg-background-dark py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 flex flex-col gap-4 text-center sm:mx-auto sm:max-w-2xl">
            <h2 className="text-primary text-sm font-bold uppercase tracking-wider">Core Capabilities</h2>
            <h3 className="text-3xl font-black tracking-tight text-[#0d121b] dark:text-white sm:text-4xl">
              Everything needed to manage your people
            </h3>
            <p className="text-lg text-[#4c669a] dark:text-gray-400">
              One unified platform that scales with your business needs. No more scattered spreadsheets or disconnected tools.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-[#e7ebf3] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-surface-dark">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[28px]">person_search</span>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-[#0d121b] dark:text-white">Smart Recruitment</h4>
                <p className="text-[#4c669a] dark:text-gray-400">Streamline hiring workflows, track applicants, and find the best talent faster with automated screening.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-[#e7ebf3] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-surface-dark">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[28px]">payments</span>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-[#0d121b] dark:text-white">Automated Payroll</h4>
                <p className="text-[#4c669a] dark:text-gray-400">Run payroll in minutes. Automated tax calculations, deductions, and multi-country compliance built-in.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-[#e7ebf3] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-surface-dark">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[28px]">bar_chart_4_bars</span>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-[#0d121b] dark:text-white">People Analytics</h4>
                <p className="text-[#4c669a] dark:text-gray-400">Gain actionable insights into workforce trends, retention rates, and performance metrics instantly.</p>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-[#e7ebf3] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-surface-dark">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[28px]">badge</span>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-[#0d121b] dark:text-white">Self-Service Portal</h4>
                <p className="text-[#4c669a] dark:text-gray-400">Empower employees to manage their own profiles, time-off requests, and benefits enrollment.</p>
              </div>
            </div>
            {/* Feature 5 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-[#e7ebf3] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-surface-dark">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[28px]">school</span>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-[#0d121b] dark:text-white">Learning &amp; Development</h4>
                <p className="text-[#4c669a] dark:text-gray-400">Identify skill gaps and assign training modules to foster continuous growth within your teams.</p>
              </div>
            </div>
            {/* Feature 6 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-[#e7ebf3] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-surface-dark">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[28px]">security</span>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-[#0d121b] dark:text-white">Enterprise Security</h4>
                <p className="text-[#4c669a] dark:text-gray-400">Bank-grade encryption, role-based access controls, and SOC2 compliance to keep data safe.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial / Client Success */}
      <div className="w-full bg-surface-light dark:bg-surface-dark py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div 
                className="h-full w-full overflow-hidden rounded-2xl shadow-xl" 
                data-alt="Two professionals discussing work in a modern office environment" 
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAq53oyweHGTkwgDKkoHMI8tFMKGOk5pKImD1aHjwyDJMYRVEefUZKUr99yJikpWB39EY-ihxo8sq1NcyZcU12r_v9864SOg7B2GWZm5y4MCHFD86uAoi0on3Vnm_sWWV8AJ9-yZtMjyVbsTs3ogJUJgFcCLjPrjn82H7v4FLxURDhjAlxzihgjTnCSEB9OT7OXR9VA0WrGHhhi9aTRR42yXTPjcdu_g68Qq6slLE2QZ5ClcyxESmSALPle6LoAmZ3fKFf85IaBrw')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '400px'
                }}
              >
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-6 lg:pl-10">
              <span className="material-symbols-outlined !text-5xl text-primary/40">format_quote</span>
              <blockquote className="text-2xl font-bold leading-relaxed text-[#0d121b] dark:text-white md:text-3xl">
                "Dayflow has revolutionized how we manage our global teams. The analytics dashboard alone saved us hundreds of hours in quarterly reporting."
              </blockquote>
              <div className="flex items-center gap-4 pt-4 border-t border-[#e7ebf3] dark:border-gray-700">
                <div 
                  className="h-12 w-12 overflow-hidden rounded-full bg-gray-200" 
                  data-alt="Portrait of Sarah Jenkins" 
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEe-cYPzVPs3W4FnzPQCHg0t_zcWL0Cbt51yxuiDqD_DZ_Yp1PU_f-H2tcDM0M5zkz81y944FPJ6I2BHd_txGShd1_uNxlfqsgy2jJp8hWV1I77AAxg6cxCYZDlSHtItkVtErjKDS8fOxh-iuscCYCpEG9jsoGdl73J0q-IYJt_MbO9XlcZZc25nT_vTzPmG7E5cySfj7-iQHxS7VLSDH5gL4J-JI4dviL3DQjRXLuNH6MJo06-0MlSiPL81tY4E-xPAb4W7rvbg')",
                    backgroundSize: 'cover'
                  }}
                >
                </div>
                <div>
                  <p className="text-base font-bold text-[#0d121b] dark:text-white">Sarah Jenkins</p>
                  <p className="text-sm text-[#4c669a] dark:text-gray-400">VP of HR at TechGlobal Inc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-background-light dark:bg-background-dark py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 shadow-2xl sm:px-16 md:pt-20 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            {/* Background Pattern */}
            <svg aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0" viewBox="0 0 1024 1024">
              <circle cx="512" cy="512" fill="url(#gradient)" fillOpacity="0.25" r="512"></circle>
              <defs>
                <radialGradient id="gradient">
                  <stop stopColor="#ffffff"></stop>
                  <stop offset="1" stopColor="#ffffff"></stop>
                </radialGradient>
              </defs>
            </svg>
            <div className="mx-auto text-center lg:mx-0 lg:flex-auto lg:py-24">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to transform your HR?</h2>
              <p className="mt-6 text-lg leading-8 text-blue-100">
                Join 500+ enterprises who trust Dayflow. Start your free 14-day trial today or schedule a personalized demo.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button 
                  onClick={() => navigate('/login')}
                  className="rounded-lg bg-white px-8 py-3 text-base font-bold text-primary shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get Started
                </button>
                <a className="text-base font-semibold leading-6 text-white hover:text-blue-100 flex items-center gap-2" href="#">
                  Contact Sales <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e7ebf3] bg-surface-light dark:bg-surface-dark dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 text-[#0d121b] dark:text-white">
                <span className="material-symbols-outlined text-primary">group_work</span>
                <span className="text-lg font-bold">Dayflow</span>
              </div>
              <p className="text-sm leading-6 text-[#4c669a] dark:text-gray-400 max-w-xs">
                The intelligent HR platform for modern enterprises. Simplify complex workflows and focus on your people.
              </p>
              <div className="mt-6 flex gap-4">
                {/* Social Placeholders */}
                <a className="text-gray-400 hover:text-primary" href="#"><span className="material-symbols-outlined">public</span></a>
                <a className="text-gray-400 hover:text-primary" href="#"><span className="material-symbols-outlined">mail</span></a>
                <a className="text-gray-400 hover:text-primary" href="#"><span className="material-symbols-outlined">call</span></a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-[#0d121b] dark:text-white">Product</h3>
              <ul className="mt-4 space-y-3" role="list">
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Features</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Integrations</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Pricing</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Releases</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-[#0d121b] dark:text-white">Company</h3>
              <ul className="mt-4 space-y-3" role="list">
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">About Us</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Careers</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Press</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-[#0d121b] dark:text-white">Legal</h3>
              <ul className="mt-4 space-y-3" role="list">
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Privacy</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Terms</a></li>
                <li><a className="text-sm leading-6 text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-primary" href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[#e7ebf3] dark:border-gray-800 pt-8">
            <p className="text-xs leading-5 text-gray-500">© 2024 Dayflow Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
