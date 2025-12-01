'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/theme-context';
import { notFound } from 'next/navigation';

const blogPosts: Record<string, {
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: React.ReactNode;
}> = {
  'under-1-second-fast-commerce': {
    title: 'Under 1 Second: The Hidden Science of Fast Commerce Sites',
    description: 'Benchmark myths, real metrics, and measuring what actually matters for eCommerce performance.',
    date: 'November 2024',
    readTime: '8 min read',
    category: 'Performance',
    content: (
      <>
        <p>The eCommerce industry is obsessed with speed, but most are measuring the wrong things. When we talk about "sub-second load times," what does that actually mean for your revenue?</p>

        <h2>The Benchmark Myth</h2>
        <p>Every agency claims fast sites. Few can prove it. The problem isn't speed—it's measurement. Google's Core Web Vitals changed the game, but most teams still chase vanity metrics that don't correlate with conversions.</p>
        <p>Here's what actually matters:</p>
        <ul>
          <li><strong>Largest Contentful Paint (LCP):</strong> When does the main content appear? Under 2.5 seconds is "good," but under 1 second is where conversion rates spike.</li>
          <li><strong>First Input Delay (FID):</strong> How fast can users interact? Anything over 100ms feels laggy.</li>
          <li><strong>Cumulative Layout Shift (CLS):</strong> Does your page jump around? Visual stability builds trust.</li>
        </ul>

        <h2>Real Metrics From Real Stores</h2>
        <p>We've analyzed hundreds of eCommerce deployments. The pattern is clear:</p>
        <ul>
          <li>Every 100ms of delay costs 1% in conversions</li>
          <li>Mobile users are 5x more sensitive to speed than desktop</li>
          <li>Product pages need to load faster than homepages (users are closer to purchase)</li>
        </ul>

        <h2>What Actually Slows You Down</h2>
        <p>It's rarely what you think. The usual suspects:</p>
        <ul>
          <li><strong>Third-party scripts:</strong> Analytics, chat widgets, and tracking pixels can add 2-3 seconds alone</li>
          <li><strong>Unoptimized images:</strong> A single hero image can be 5MB. It should be 50KB.</li>
          <li><strong>Render-blocking resources:</strong> CSS and JavaScript that blocks the critical path</li>
          <li><strong>Poor hosting:</strong> Cheap shared hosting with 500ms+ server response times</li>
        </ul>

        <h2>The Fix</h2>
        <p>Speed isn't about doing more—it's about doing less, faster. Our approach:</p>
        <ol>
          <li>Audit ruthlessly: Remove what doesn't convert</li>
          <li>Optimize the critical path: First paint under 500ms</li>
          <li>Edge everything: CDN for static, edge functions for dynamic</li>
          <li>Lazy load aggressively: Below-fold content loads on scroll</li>
        </ol>

        <p>The result? Sites that feel instant. Because perception is reality, and reality is revenue.</p>
      </>
    ),
  },
  'remove-drag-f2-car-web-systems': {
    title: 'Remove Drag: How We Build Web Systems Like an F2 Car',
    description: 'Performance through elimination and intentional compute. Why less is exponentially more.',
    date: 'November 2024',
    readTime: '6 min read',
    category: 'Architecture',
    content: (
      <>
        <p>Formula 2 cars aren't fast because they have more—they're fast because every unnecessary gram has been eliminated. The same principle applies to web architecture.</p>

        <h2>The Weight Problem</h2>
        <p>Most web projects accumulate weight over time. A dependency here, a library there, a "quick fix" that becomes permanent. Before you know it, your bundle is 2MB and your server is doing work it doesn't need to do.</p>
        <p>We call this "architectural drag." It's invisible until it isn't.</p>

        <h2>Intentional Compute</h2>
        <p>Every computation should justify its existence. Questions we ask on every project:</p>
        <ul>
          <li>Does this need to happen on the server, or can it be static?</li>
          <li>Does this need JavaScript, or can it be CSS?</li>
          <li>Does this need to load now, or can it wait?</li>
          <li>Does this need to exist at all?</li>
        </ul>

        <h2>The Elimination Checklist</h2>
        <p>Before adding anything, we subtract:</p>
        <ul>
          <li><strong>Dependencies:</strong> Can we write 20 lines instead of importing 20KB?</li>
          <li><strong>API calls:</strong> Can we cache this? Pre-render it? Eliminate it?</li>
          <li><strong>Database queries:</strong> Are we fetching data we don't display?</li>
          <li><strong>Animations:</strong> Does this motion serve the user or just look cool?</li>
        </ul>

        <h2>Real Example: The 90% Reduction</h2>
        <p>A recent project inherited a React app with 47 dependencies. After our audit:</p>
        <ul>
          <li>Dependencies: 47 → 12</li>
          <li>Bundle size: 1.8MB → 180KB</li>
          <li>Build time: 4 minutes → 22 seconds</li>
          <li>Time to Interactive: 4.2s → 0.8s</li>
        </ul>
        <p>Same functionality. 90% less weight. That's the power of elimination.</p>

        <h2>The F2 Philosophy</h2>
        <p>In racing, they say "adding lightness" is faster than adding power. In web development, removing code is faster than optimizing it.</p>
        <p>The fastest request is the one you never make. The fastest code is the code that doesn't exist.</p>
      </>
    ),
  },
  'users-want-less-delay': {
    title: "Users Don't Want More Code—They Want Less Delay",
    description: 'The perception of performance, psychology of speed, and why milliseconds matter more than features.',
    date: 'October 2024',
    readTime: '5 min read',
    category: 'UX',
    content: (
      <>
        <p>Your users don't care about your tech stack. They don't care about your architecture. They care about one thing: did this feel fast?</p>

        <h2>Perception vs. Reality</h2>
        <p>Here's the thing about speed: it's psychological. A site that loads in 2 seconds but shows progress feels faster than a site that loads in 1.5 seconds with a blank screen.</p>
        <p>This is why perceived performance often matters more than actual performance.</p>

        <h2>The Psychology of Waiting</h2>
        <p>Research shows:</p>
        <ul>
          <li><strong>0-100ms:</strong> Feels instant</li>
          <li><strong>100-300ms:</strong> Noticeable but acceptable</li>
          <li><strong>300-1000ms:</strong> User loses focus</li>
          <li><strong>1000ms+:</strong> User loses trust</li>
        </ul>
        <p>After 3 seconds, 53% of mobile users abandon. They're not checking your features—they're already gone.</p>

        <h2>Features vs. Speed: The False Choice</h2>
        <p>Teams often frame this as a tradeoff. "We need these features, so the site will be slower." This is backwards.</p>
        <p>Speed IS a feature. The most important one. A fast site with fewer features will outperform a slow site with more features. Every time.</p>

        <h2>What Users Actually Want</h2>
        <ul>
          <li><strong>Immediate feedback:</strong> Click → something happens</li>
          <li><strong>Visual stability:</strong> Things don't jump around</li>
          <li><strong>Progressive loading:</strong> Content appears in order of importance</li>
          <li><strong>Responsive interactions:</strong> Buttons feel clickable, scrolling feels smooth</li>
        </ul>

        <h2>The Delay Tax</h2>
        <p>Every millisecond of delay is a tax on user patience. And that tax compounds:</p>
        <ul>
          <li>Slow homepage → fewer product views</li>
          <li>Slow product page → fewer add-to-carts</li>
          <li>Slow checkout → abandoned carts</li>
        </ul>
        <p>The math is simple: delay destroys revenue. Speed creates it.</p>
      </>
    ),
  },
  'what-99-uptime-means': {
    title: 'What 99.99% Uptime Means When Code Actually Goes Fast',
    description: 'Reliability vs performance, real SLA storytelling, and the hidden costs of downtime.',
    date: 'October 2024',
    readTime: '7 min read',
    category: 'Infrastructure',
    content: (
      <>
        <p>Everyone promises 99.99% uptime. But what does that actually mean for your business? Let's do the math.</p>

        <h2>The Uptime Math</h2>
        <ul>
          <li><strong>99% uptime:</strong> 3.65 days of downtime per year</li>
          <li><strong>99.9% uptime:</strong> 8.76 hours of downtime per year</li>
          <li><strong>99.99% uptime:</strong> 52.6 minutes of downtime per year</li>
          <li><strong>99.999% uptime:</strong> 5.26 minutes of downtime per year</li>
        </ul>
        <p>That jump from 99% to 99.99% isn't incremental—it's exponential in both difficulty and value.</p>

        <h2>The Hidden Cost of "Down"</h2>
        <p>Downtime isn't just lost sales. It's:</p>
        <ul>
          <li><strong>Lost trust:</strong> Users remember when you weren't there</li>
          <li><strong>SEO damage:</strong> Google notices when your site is unavailable</li>
          <li><strong>Support costs:</strong> Every minute down generates tickets</li>
          <li><strong>Team stress:</strong> 3 AM pages destroy morale</li>
        </ul>

        <h2>Speed and Reliability: The Connection</h2>
        <p>Here's what most people miss: fast code is reliable code. Why?</p>
        <ul>
          <li>Less code = fewer failure points</li>
          <li>Faster responses = less resource contention</li>
          <li>Simpler architecture = easier recovery</li>
          <li>Edge distribution = no single point of failure</li>
        </ul>

        <h2>How We Achieve 99.99%</h2>
        <ol>
          <li><strong>Multi-region deployment:</strong> If one region fails, traffic routes automatically</li>
          <li><strong>Health checks:</strong> Continuous monitoring with automatic failover</li>
          <li><strong>Graceful degradation:</strong> Core functionality works even when secondary services fail</li>
          <li><strong>Zero-downtime deploys:</strong> Updates without interruption</li>
        </ol>

        <h2>The Real SLA Story</h2>
        <p>An SLA is a promise. But promises are only as good as the architecture behind them. We don't just promise uptime—we engineer for it from day one.</p>
        <p>Because 52 minutes of downtime per year might sound acceptable. Until it's Black Friday.</p>
      </>
    ),
  },
  'weightless-architecture': {
    title: 'Weightless Architecture: Fewer Parts, Faster Results',
    description: 'Light builds, smart decisions, and low overhead stacks that scale without complexity.',
    date: 'September 2024',
    readTime: '6 min read',
    category: 'Engineering',
    content: (
      <>
        <p>The best architecture is the one you don't notice. It gets out of the way. It doesn't require a team of specialists to maintain. It just works.</p>

        <h2>The Complexity Trap</h2>
        <p>Modern web development loves complexity. Microservices. Kubernetes. Event sourcing. These tools have their place—but that place isn't "every project."</p>
        <p>Most businesses don't need Netflix's architecture. They need something that works, scales reasonably, and doesn't require a DevOps team to keep running.</p>

        <h2>The Weightless Stack</h2>
        <p>Our default stack for most projects:</p>
        <ul>
          <li><strong>Next.js:</strong> Full-stack React with built-in optimization</li>
          <li><strong>Edge functions:</strong> Compute at the CDN layer, not a central server</li>
          <li><strong>Managed database:</strong> Let someone else handle replication and backups</li>
          <li><strong>Static where possible:</strong> Pre-render everything you can</li>
        </ul>
        <p>This stack handles millions of requests. It deploys in seconds. It costs less than your coffee budget.</p>

        <h2>Smart Decisions, Not More Decisions</h2>
        <p>Every architectural choice should answer: "Does this make things simpler or more complex?"</p>
        <ul>
          <li>Adding a service? It better remove more complexity than it adds.</li>
          <li>Adding a dependency? It better save more code than it costs.</li>
          <li>Adding infrastructure? It better solve a real problem you have today.</li>
        </ul>

        <h2>Scaling Without Suffering</h2>
        <p>The best time to optimize for scale is never. The second best time is when you actually need it.</p>
        <p>Start simple. Measure. Optimize bottlenecks. Repeat.</p>
        <p>Most "scale problems" are actually "bad architecture problems." Fix the architecture, and scale takes care of itself.</p>

        <h2>The Weightless Manifesto</h2>
        <ol>
          <li>Fewer moving parts = fewer failure modes</li>
          <li>Managed services over self-hosted complexity</li>
          <li>Static over dynamic when possible</li>
          <li>Edge over origin for latency-sensitive operations</li>
          <li>Simplicity is a feature, not a compromise</li>
        </ol>
        <p>Build light. Ship fast. Sleep well.</p>
      </>
    ),
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { theme } = useTheme();
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Header */}
      <article className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            {/* Back Link */}
            <Link
              href="/blog"
              className={`inline-flex items-center gap-2 text-sm mb-8 transition-colors ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            {/* Category */}
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
              theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              {post.category}
            </div>

            {/* Title */}
            <h1 className={`text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {post.title}
            </h1>

            {/* Meta */}
            <div className={`flex items-center gap-4 text-sm mb-12 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            {/* Content */}
            <div className={`prose prose-lg max-w-none ${
              theme === 'dark' ? 'prose-invert' : ''
            } ${theme === 'dark' ? '[&_p]:text-gray-300 [&_li]:text-gray-300 [&_h2]:text-white [&_strong]:text-white' : '[&_p]:text-gray-600 [&_li]:text-gray-600 [&_h2]:text-gray-900'}`}>
              {post.content}
            </div>

            {/* CTA */}
            <div className={`mt-16 p-8 rounded-2xl ${
              theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Want to build something fast?
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Let's talk about how we can apply these principles to your project.
              </p>
              <Link
                href="/start-project"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Start a Project
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
