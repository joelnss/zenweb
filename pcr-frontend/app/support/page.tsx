'use client';

import Link from 'next/link';

const softwareResources = [
  {
    name: 'CCleaner',
    description: 'Professional system cleaning and optimization tool. Removes temporary files, browser cache, and registry errors to improve system performance. Essential for maintaining PC health and freeing up disk space.',
    category: 'System Utilities',
    url: 'https://www.ccleaner.com/ccleaner/download',
    icon: '🧹'
  },
  {
    name: 'MalwareBytes',
    description: 'Industry-leading malware detection and removal software. Protects against viruses, ransomware, spyware, and other advanced threats. Includes real-time protection and scheduled scanning capabilities.',
    category: 'Security',
    url: 'https://www.malwarebytes.com/mwb-download',
    icon: '🛡️'
  },
  {
    name: 'Adobe Acrobat Reader',
    description: 'The trusted standard for viewing, printing, and annotating PDF documents. Essential for business documentation, forms, and contracts. Free version includes basic PDF viewing and commenting tools.',
    category: 'Productivity',
    url: 'https://get.adobe.com/reader/',
    icon: '📄'
  },
  {
    name: 'Apache OpenOffice',
    description: 'Complete open-source office productivity suite including word processor, spreadsheet, presentation, and database applications. Compatible with Microsoft Office formats. Great free alternative to paid office suites.',
    category: 'Productivity',
    url: 'https://www.openoffice.org/download/',
    icon: '📊'
  },
  {
    name: 'LibreOffice',
    description: 'Powerful and actively maintained open-source office suite. Includes Writer (word processing), Calc (spreadsheets), Impress (presentations), Draw (graphics), and Base (databases). Full compatibility with Microsoft Office files.',
    category: 'Productivity',
    url: 'https://www.libreoffice.org/download/download/',
    icon: '📝'
  },
  {
    name: 'Google Chrome',
    description: 'Fast, secure, and widely supported web browser from Google. Features built-in security, automatic updates, extensive extension library, and seamless integration with Google services.',
    category: 'Web Browser',
    url: 'https://www.google.com/chrome/',
    icon: '🌐'
  },
  {
    name: 'Mozilla Firefox',
    description: 'Privacy-focused web browser with robust security features. Includes tracking protection, customizable interface, and extensive add-on ecosystem. Great choice for users prioritizing privacy.',
    category: 'Web Browser',
    url: 'https://www.mozilla.org/en-US/firefox/new/',
    icon: '🦊'
  },
  {
    name: 'VLC Media Player',
    description: 'Universal media player that plays almost any video or audio format without additional codecs. Free, open-source, and includes advanced playback features like streaming and format conversion.',
    category: 'Media',
    url: 'https://www.videolan.org/vlc/',
    icon: '🎬'
  },
  {
    name: '7-Zip',
    description: 'Free and powerful file archiving utility supporting multiple compression formats including ZIP, RAR, 7z, and more. Features strong AES-256 encryption and high compression ratios.',
    category: 'Utilities',
    url: 'https://www.7-zip.org/download.html',
    icon: '📦'
  },
  {
    name: 'TeamViewer',
    description: 'Remote desktop software for remote access and support. Allows secure connections to computers anywhere. Essential tool for remote troubleshooting and IT support.',
    category: 'Remote Support',
    url: 'https://www.teamviewer.com/en-us/download/',
    icon: '💻'
  },
  {
    name: 'AnyDesk',
    description: 'Lightweight remote desktop application with low latency and high frame rates. Perfect for remote work and IT support. Faster alternative to traditional remote desktop solutions.',
    category: 'Remote Support',
    url: 'https://anydesk.com/en/downloads',
    icon: '🖥️'
  },
  {
    name: 'Microsoft Edge',
    description: 'Microsoft\'s modern browser built on Chromium. Integrates seamlessly with Windows and Microsoft services. Features include Collections, vertical tabs, and enhanced security.',
    category: 'Web Browser',
    url: 'https://www.microsoft.com/en-us/edge/download',
    icon: '🔷'
  }
];

const hardwareGuides = [
  {
    title: 'Common Hardware Issues',
    items: [
      {
        issue: 'Computer Won\'t Turn On',
        solutions: [
          'Check power cable connections at both wall and PC',
          'Test with different power outlet',
          'Verify power supply switch is in ON position',
          'Check for motherboard LED indicators',
          'Test power supply unit (PSU) with multimeter or PSU tester'
        ]
      },
      {
        issue: 'Slow Computer Performance',
        solutions: [
          'Check Task Manager for high CPU/memory usage',
          'Scan for malware and viruses',
          'Clean temporary files and browser cache',
          'Upgrade RAM if usage consistently above 80%',
          'Replace HDD with SSD for dramatic speed improvement',
          'Ensure adequate cooling and clean dust from fans'
        ]
      },
      {
        issue: 'No Display / Black Screen',
        solutions: [
          'Verify monitor power and input source',
          'Check video cable connections (HDMI, DisplayPort, VGA)',
          'Test with different display cable or monitor',
          'Reseat graphics card in PCIe slot',
          'Try onboard graphics if available',
          'Reset BIOS by removing CMOS battery for 30 seconds'
        ]
      },
      {
        issue: 'Overheating Issues',
        solutions: [
          'Clean dust from fans and heat sinks using compressed air',
          'Verify all fans are spinning (CPU, GPU, case fans)',
          'Reapply thermal paste on CPU',
          'Improve case airflow with additional fans',
          'Monitor temperatures with HWMonitor or Core Temp',
          'Ensure adequate ventilation around computer'
        ]
      },
      {
        issue: 'Random Restarts or Blue Screens',
        solutions: [
          'Check Windows Event Viewer for error codes',
          'Test RAM with MemTest86',
          'Update all device drivers',
          'Scan for malware and system file corruption (sfc /scannow)',
          'Check for failing hard drive with CrystalDiskInfo',
          'Verify power supply provides stable voltage'
        ]
      },
      {
        issue: 'USB Ports Not Working',
        solutions: [
          'Try different USB ports (front and rear)',
          'Check Device Manager for driver issues',
          'Uninstall and reinstall USB controllers',
          'Disable USB selective suspend in power settings',
          'Update motherboard chipset drivers',
          'Reset BIOS to default settings'
        ]
      }
    ]
  }
];

const softwareGuides = [
  {
    title: 'Common Software Issues',
    items: [
      {
        issue: 'Windows Update Problems',
        solutions: [
          'Run Windows Update Troubleshooter',
          'Clear Windows Update cache (delete C:\\Windows\\SoftwareDistribution)',
          'Restart Windows Update service',
          'Use DISM and SFC commands to repair system files',
          'Temporarily disable antivirus during update',
          'Manually download updates from Microsoft Update Catalog'
        ]
      },
      {
        issue: 'Application Crashes or Freezes',
        solutions: [
          'Update application to latest version',
          'Run application as administrator',
          'Check compatibility mode settings',
          'Repair or reinstall the application',
          'Update graphics drivers for graphics-intensive apps',
          'Increase virtual memory/page file size',
          'Check application event logs for specific errors'
        ]
      },
      {
        issue: 'Internet Connection Problems',
        solutions: [
          'Restart router and modem (power cycle for 30 seconds)',
          'Run Network Troubleshooter in Windows',
          'Reset network adapter (ipconfig /release, /renew)',
          'Flush DNS cache (ipconfig /flushdns)',
          'Update network adapter drivers',
          'Reset TCP/IP stack (netsh int ip reset)',
          'Temporarily disable firewall to test connectivity'
        ]
      },
      {
        issue: 'Microsoft Office Activation Issues',
        solutions: [
          'Verify product key is valid and not expired',
          'Run Office activation troubleshooter',
          'Sign in with correct Microsoft account',
          'Repair Office installation from Control Panel',
          'Remove old Office license (office.com/myaccount)',
          'Contact Microsoft support for volume licensing issues'
        ]
      },
      {
        issue: 'Email Client Not Receiving/Sending',
        solutions: [
          'Verify internet connection is working',
          'Check email account settings (IMAP/POP3/SMTP)',
          'Confirm correct server addresses and ports',
          'Disable antivirus email scanning temporarily',
          'Check mailbox storage quota',
          'Test with webmail to isolate client vs server issue',
          'Recreate email account profile'
        ]
      },
      {
        issue: 'Printer Not Working',
        solutions: [
          'Restart printer and computer',
          'Check printer is set as default device',
          'Verify USB or network connection',
          'Clear print queue and restart print spooler service',
          'Update or reinstall printer drivers',
          'Run Windows Printer Troubleshooter',
          'Check for paper jams and low ink/toner'
        ]
      }
    ]
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Support & Resources</h1>
            <p className="text-xl text-blue-100 mb-8">
              Access our comprehensive library of software downloads, troubleshooting guides, and technical resources to help you resolve common IT issues.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/#submit-ticket"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Submit a Support Ticket
              </Link>
              <a
                href="tel:+1234567890"
                className="px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-800 transition-all"
              >
                Call for Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Remote Support Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl shadow-xl p-12 border-2 border-blue-200 mb-16">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Remote Support Service</h2>
              <p className="text-xl text-gray-700 mb-6">
                Let us help you with your computer concerns online!
              </p>
              <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
                Allow our highly trained and certified professional technicians to answer your technical questions and resolve your issues remotely.
                We provide fast, secure remote assistance for software troubleshooting, configuration, and optimization.
                No need to bring your computer in - we fix it from wherever you are.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="https://www.teamviewer.com/en-us/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
                >
                  Download TeamViewer
                </a>
                <a
                  href="https://anydesk.com/en/downloads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-all"
                >
                  Download AnyDesk
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Software Downloads Section */}
      <div className="container mx-auto px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Software Resource Center</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Download essential software tools recommended by our technicians. All links direct to official sources for your security.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {softwareResources.map((software, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{software.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{software.name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {software.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {software.description}
                    </p>
                    <a
                      href={software.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      Download Now
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hardware Troubleshooting Guide */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Hardware Troubleshooting Guide</h2>
            <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Common hardware issues and step-by-step solutions. If these don't resolve your problem, submit a ticket for professional assistance.
            </p>

            {hardwareGuides.map((guide, guideIndex) => (
              <div key={guideIndex} className="space-y-6">
                {guide.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-8"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {itemIndex + 1}
                      </span>
                      {item.issue}
                    </h3>
                    <div className="ml-11">
                      <p className="font-semibold text-gray-700 mb-3">Troubleshooting Steps:</p>
                      <ul className="space-y-2">
                        {item.solutions.map((solution, solIndex) => (
                          <li key={solIndex} className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Software Troubleshooting Guide */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Software Troubleshooting Guide</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Resolve common software and operating system issues with these proven solutions.
          </p>

          {softwareGuides.map((guide, guideIndex) => (
            <div key={guideIndex} className="space-y-6">
              {guide.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="bg-gradient-to-br from-gray-50 to-cyan-50 rounded-xl border border-gray-200 p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {itemIndex + 1}
                    </span>
                    {item.issue}
                  </h3>
                  <div className="ml-11">
                    <p className="font-semibold text-gray-700 mb-3">Troubleshooting Steps:</p>
                    <ul className="space-y-2">
                      {item.solutions.map((solution, solIndex) => (
                        <li key={solIndex} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gray-900 text-white py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/AdobeStock_1529223722.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gray-900/80"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our expert technicians are standing by to assist you. Submit a support ticket and we'll get back to you promptly.
          </p>
          <Link
            href="/#submit-ticket"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Get Professional Support
          </Link>
        </div>
      </div>
    </div>
  );
}
