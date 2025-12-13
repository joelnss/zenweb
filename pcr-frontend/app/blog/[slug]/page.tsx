'use client';

import { use } from 'react';
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
        <p>There's a moment in every garage—right before the engine turns over—when you can smell possibility. That sharp bite of motor oil, the metallic promise of something about to move. That's what a fast website should feel like. Immediate. Inevitable.</p>

        <p>The eCommerce industry talks endlessly about speed. But most of them are measuring the wrong things entirely. Like timing a race car by how loud it sounds.</p>

        <h2>The Myth We've All Been Sold</h2>

        <p>Every agency claims fast sites. Precious few can prove it.</p>

        <p>The problem isn't speed itself—it's how we measure it. Google's Core Web Vitals changed the conversation, but most teams are still chasing vanity metrics. Numbers that look impressive in a pitch deck but don't move a single needle where it matters: the checkout.</p>

        <h2>What Actually Matters</h2>

        <p><strong>Largest Contentful Paint (LCP)</strong> — When does your customer see something real? Under 2.5 seconds is considered "good." Under 1 second is where conversion rates start climbing like RPMs in a clean engine.</p>

        <p><strong>First Input Delay (FID)</strong> — How fast can they touch something and feel it respond? Anything over 100 milliseconds feels like lag. Like a sticky throttle. Users notice.</p>

        <p><strong>Cumulative Layout Shift (CLS)</strong> — Does your page jump around while loading? Visual stability builds trust. Instability breeds abandonment.</p>

        <h2>The Numbers Don't Lie</h2>

        <p>We've put hundreds of eCommerce sites on the dyno. The pattern is ruthlessly consistent:</p>

        <p>Every 100 milliseconds of delay costs you 1% in conversions. That's not poetry—that's physics.</p>

        <p>Mobile users are five times more sensitive to speed than desktop. They're standing in line. They're between meetings. They don't wait.</p>

        <p>Product pages need to load faster than homepages. By the time someone's looking at a product, they're closer to the money. Don't fumble the handoff.</p>

        <h2>What's Actually Slowing You Down</h2>

        <p>It's rarely what you think. The culprits hide in plain sight:</p>

        <p><strong>Third-party scripts.</strong> Analytics, chat widgets, tracking pixels—each one a small weight. Together, they can add 2-3 seconds of drag. Death by a thousand cuts.</p>

        <p><strong>Unoptimized images.</strong> I've seen hero images weighing in at 5 megabytes. They should be 50 kilobytes. That's not a typo. That's a 100x difference.</p>

        <p><strong>Render-blocking resources.</strong> CSS and JavaScript that refuses to let the page breathe until it's fully loaded. Like flooding an engine before it can turn over.</p>

        <p><strong>Bargain hosting.</strong> Cheap shared servers with 500ms response times before a single byte of your site even starts loading. You're losing the race before it begins.</p>

        <h2>The Fix</h2>

        <p>Speed isn't about adding more horsepower. It's about removing weight. Every gram. Every unnecessary line.</p>

        <p>Audit ruthlessly. If it doesn't convert, it doesn't belong.</p>

        <p>Optimize the critical path. First paint under 500 milliseconds. Non-negotiable.</p>

        <p>Push everything to the edge. CDN for static assets. Edge functions for the dynamic stuff. Get closer to your customers, geographically.</p>

        <p>Lazy load aggressively. Below-fold content can wait its turn.</p>

        <h2>The Payoff</h2>

        <p>The result is a site that feels instant. That hums. That responds to every touch like a well-tuned machine.</p>

        <p>Because in the end, perception is reality. And reality is revenue.</p>
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
        <p>Racing engineers have a saying: the best part is no part. Every component on an F2 car has to justify its weight. If it doesn't contribute to going faster, it gets removed.</p>

        <p>Web development should work the same way. But it usually doesn't.</p>

        <h2>How Websites Get Slow</h2>

        <p>Nobody sets out to build a slow website. It happens gradually. A tracking script here. A new library there. A "temporary" fix that becomes permanent. Six months later, your site loads 47 JavaScript files before showing a single product.</p>

        <p>We call this architectural drag. It's the invisible weight that accumulates when teams optimize for shipping features instead of shipping fast features.</p>

        <p>The average eCommerce site now loads over 2MB of resources. Most of that is unnecessary.</p>

        <h2>The Questions That Matter</h2>

        <p>Before we add anything to a project, we ask four questions:</p>

        <p>First: does this need to run on the server, or can it be generated at build time? Static content is always faster than dynamic content.</p>

        <p>Second: does this need JavaScript, or can we do it with CSS? CSS animations run on the GPU. JavaScript runs on the main thread where it competes with everything else.</p>

        <p>Third: does this need to load immediately, or can it wait until the user scrolls? Lazy loading is one of the simplest performance wins available.</p>

        <p>Fourth: does this need to exist at all? Sometimes the best optimization is deletion.</p>

        <h2>A Real Example</h2>

        <p>We recently audited a React application with 47 npm dependencies. The client thought they needed all of them. After reviewing what each package actually did, we found a different story.</p>

        <p>Twelve dependencies were doing useful work. The other thirty-five were either redundant, unused, or could be replaced with a few lines of custom code.</p>

        <p>The results: bundle size dropped from 1.8MB to 180KB. Build time went from 4 minutes to 22 seconds. Time to Interactive improved from 4.2 seconds to 0.8 seconds.</p>

        <p>Same features. Same functionality. Just less weight.</p>

        <h2>Building Light From Day One</h2>

        <p>The easiest way to have a fast website is to never make it slow in the first place. That means questioning every addition before it happens, not trying to optimize your way out of bloat after the fact.</p>

        <p>When someone proposes adding a new tool or library, we ask what we can remove to make room for it. The answer is usually that we don't need the new thing after all.</p>

        <p>Less code means fewer bugs. Fewer bugs mean less maintenance. Less maintenance means more time building features that matter.</p>
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
        <p>Here's something that took the industry too long to figure out: users don't experience your technology. They experience the wait.</p>

        <p>Nobody has ever bought a product because the website was built with React instead of Vue. But plenty of people have abandoned their carts because the checkout took too long to load.</p>

        <h2>How Speed Actually Works in the Brain</h2>

        <p>Human perception of time isn't linear. The difference between 100 milliseconds and 200 milliseconds feels negligible. The difference between 2 seconds and 4 seconds feels enormous. Our brains are wired to notice delays once they cross certain thresholds.</p>

        <p>Under 100 milliseconds, interactions feel instant. The button pressed, the thing happened. No conscious awareness of waiting.</p>

        <p>Between 100 and 300 milliseconds, users notice the delay but accept it as normal. This is the sweet spot for most interactions.</p>

        <p>Between 300 milliseconds and 1 second, attention starts to drift. The brain registers that something is taking time. Users become aware they're waiting.</p>

        <p>Beyond 1 second, you've lost them. Maybe not literally, but psychologically they've disengaged. They're thinking about other things, other tabs, other options.</p>

        <h2>The Research Says Abandon</h2>

        <p>Google published a study showing that 53% of mobile users abandon sites that take longer than 3 seconds to load. That's more than half your potential customers, gone before they see your product.</p>

        <p>The same research found that the probability of bounce increases 32% as page load time goes from 1 second to 3 seconds. Every second costs you customers.</p>

        <p>These aren't edge cases. This is the median experience for most eCommerce sites.</p>

        <h2>Speed Is Not a Technical Concern</h2>

        <p>When development teams discuss performance, it usually gets categorized as a technical issue. Something for engineers to worry about after the features are done.</p>

        <p>This is backwards. Speed is the feature. It's the most important feature you can ship because it affects every other feature you build.</p>

        <p>A beautiful product page that takes 5 seconds to load will convert worse than an ugly product page that loads instantly. Users have to experience your design before they can appreciate it.</p>

        <h2>What Good Feels Like</h2>

        <p>When a site is genuinely fast, you can feel it. Clicks respond immediately. Pages appear before you finish thinking about them. The scroll feels smooth and connected to your finger.</p>

        <p>This isn't magic. It's the absence of delay. It's what happens when every element of the stack is optimized for speed over convenience.</p>

        <p>Users can't articulate what makes a fast site feel good. But they notice when it's missing. And they vote with their attention.</p>
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
        <p>Uptime percentages look impressive in sales pitches. Four nines, five nines, six nines. But what do these numbers actually mean for a business trying to sell products online?</p>

        <p>The math is worth understanding because the difference between 99% and 99.99% isn't 0.99%. It's the difference between being down for three days a year versus being down for less than an hour.</p>

        <h2>Translating Percentages to Real Time</h2>

        <p>At 99% uptime, you're unavailable for roughly 3.65 days per year. That's 87 hours where customers can't buy from you, can't check their orders, can't reach your support.</p>

        <p>At 99.9% uptime, that drops to 8.76 hours per year. Better, but still enough time to lose a morning's worth of Black Friday sales.</p>

        <p>At 99.99% uptime, you're looking at 52 minutes of downtime across the entire year. For most businesses, this is acceptable. Problems happen. The goal is containing them.</p>

        <p>At 99.999% uptime, you're down for about 5 minutes per year. This is where infrastructure gets expensive and complexity increases significantly.</p>

        <h2>The Costs Nobody Mentions</h2>

        <p>Downtime has obvious costs: lost transactions, angry customers, refunds. But the hidden costs often matter more.</p>

        <p>Search engines notice when your site is unavailable. Google's crawlers might visit during an outage and find nothing. Depending on timing and frequency, this affects your rankings. Organic traffic that took years to build can erode quickly.</p>

        <p>Customer trust is hard to measure but easy to lose. People remember frustration. A single bad experience during a sale or promotion creates negative associations that linger.</p>

        <p>Support teams bear the immediate burden. Every minute of downtime generates tickets that take hours to resolve. The cost multiplies long after the site comes back online.</p>

        <h2>Why Fast Systems Are Reliable Systems</h2>

        <p>Speed and reliability aren't separate concerns. They're deeply connected.</p>

        <p>Fast systems use fewer resources per request. When traffic spikes, there's more headroom before things break. Slow systems running at 80% capacity during normal times have no room to absorb unexpected load.</p>

        <p>Simple architectures recover faster than complex ones. When something fails in a system with 50 interdependent services, finding the problem takes time. When something fails in a system with 5 well-designed components, the cause is usually obvious.</p>

        <p>Edge distribution eliminates single points of failure. If your entire site runs from one data center and that data center has an issue, you're completely down. Distribute across regions and losing one means losing nothing.</p>

        <h2>Engineering for Uptime</h2>

        <p>Achieving high uptime isn't about hoping nothing breaks. It's about assuming everything will break and building systems that handle failure gracefully.</p>

        <p>Health checks run constantly, testing every component. When something fails, traffic routes around it automatically. No human intervention required for common failures.</p>

        <p>Deploys happen without downtime. New code rolls out gradually, with automatic rollback if metrics degrade. Shipping features doesn't mean risking availability.</p>

        <p>Core functionality works even when secondary systems fail. If your recommendation engine goes down, customers can still browse and buy. Graceful degradation keeps revenue flowing during partial outages.</p>
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
        <p>Modern web development has a complexity problem. Somewhere along the way, building a website became an exercise in distributed systems engineering. Microservices, container orchestration, event-driven architectures, message queues. Tools designed for companies with thousands of engineers became standard recommendations for teams of three.</p>

        <p>Most businesses don't need this complexity. They need something that works, stays working, and doesn't require a dedicated infrastructure team to maintain.</p>

        <h2>The Overhead Nobody Talks About</h2>

        <p>Every architectural choice carries ongoing costs. Not just the initial implementation, but maintenance, monitoring, debugging, and the cognitive load on your team.</p>

        <p>A Kubernetes cluster requires someone who understands Kubernetes. A microservices architecture requires distributed tracing to debug. An event-driven system requires expertise in eventual consistency.</p>

        <p>These aren't criticisms of the technologies. They're observations about appropriate use cases. When you're building for scale you don't have yet, you're paying costs for problems you don't have.</p>

        <h2>What Actually Works for Most Businesses</h2>

        <p>After building systems for hundreds of eCommerce businesses, patterns emerge. The solutions that work long-term share common characteristics.</p>

        <p>Static generation handles more than most teams realize. Product catalogs, content pages, even personalization can often be pre-rendered with smart caching. Static files served from a CDN are as fast and reliable as websites get.</p>

        <p>Edge computing moves logic closer to users without managing servers. Functions that run at CDN nodes handle dynamic requirements without origin server round trips.</p>

        <p>Managed databases let specialists handle replication, backups, and failover. Your team focuses on your product instead of database administration.</p>

        <p>Monolithic deployments simplify debugging and deployment. When everything ships together, you don't chase issues across service boundaries.</p>

        <h2>The Decision Framework</h2>

        <p>When evaluating any architectural addition, the question isn't whether the technology is good. It's whether it reduces overall complexity for your specific situation.</p>

        <p>Adding a caching layer makes sense when you've measured a caching problem. Adding microservices makes sense when you have teams that need to deploy independently. Adding Kubernetes makes sense when you're managing enough containers that orchestration pays for itself.</p>

        <p>Until those conditions exist, simpler alternatives work better.</p>

        <h2>Scaling When You Need It</h2>

        <p>The best time to solve scaling problems is when you have them. Premature optimization creates complexity without delivering value.</p>

        <p>Simple architectures scale further than most teams expect. A well-designed monolith handles more traffic than a poorly-designed distributed system. The constraint is usually database reads, and those have straightforward solutions: caching, read replicas, static generation.</p>

        <p>When you actually encounter scaling limits, you'll understand your real bottlenecks. Solutions designed for actual problems outperform solutions designed for hypothetical ones.</p>

        <h2>Simplicity as Strategy</h2>

        <p>Keeping systems simple isn't laziness. It's discipline. The pressure to add complexity is constant. New tools, new patterns, new best practices. Resisting that pressure preserves your ability to move fast.</p>

        <p>Simple systems are easy to understand, easy to modify, and easy to fix. When something breaks at 2 AM, you want to diagnose the problem in minutes, not hours.</p>

        <p>Build the simplest thing that solves your current problems. When new problems emerge, build the simplest solutions for those. Let complexity accumulate only where it earns its place.</p>
      </>
    ),
  },
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { theme } = useTheme();
  const post = blogPosts[slug];

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
            } ${theme === 'dark' ? '[&_p]:text-gray-300 [&_li]:text-gray-300 [&_h2]:text-white [&_strong]:text-white' : '[&_p]:text-gray-600 [&_li]:text-gray-600 [&_h2]:text-gray-900'} [&_p]:mb-6 [&_h2]:mt-12 [&_h2]:mb-6 [&_p]:leading-relaxed`}>
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
