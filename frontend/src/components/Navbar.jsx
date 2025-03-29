function Navbar() {
  return (
    <nav className="bg-[#0f172a] p-3 w-full fixed border-b-[1px] border-opacity-50 border-gray-600 top-0 left-0 z-50">
    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
      {/* Left Side: Logo & Navigation */}
      <div className="flex items-center space-x-8">
        {/* Logo */}
        {/* <img
          src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.6c84f6f3.svg"
          alt="Logo"
          className="h-8 w-8"
        />
         */}

        <div class="font-bold text-3xl tracking-wide text-white font-sans">
          ChainGrant
        </div>
        {/* Navigation Links */}
        <div className="flex space-x-6">
          <a
            href="#"
            className="px-3 py-2 text-white font-medium bg-black rounded-lg"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="px-3 py-2 text-gray-300 hover:text-white transition"
          >
            Team
          </a>
          <a
            href="#"
            className="px-3 py-2 text-gray-300 hover:text-white transition"
          >
            Projects
          </a>
          <a
            href="#"
            className="px-3 py-2 text-gray-300 hover:text-white transition"
          >
            Calendar
          </a>
        </div>
      </div>

      {/* Right Side: Notification Icon & Connect Wallet */}
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <button className="text-gray-400 hover:text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </button>

        {/* Connect Wallet Button (Styled as per your image) */}
        <button className="px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600">
          Connect Wallet
        </button>
      </div>
    </div>
  </nav>
  )
}

export default Navbar;
