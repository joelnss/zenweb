'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/theme-context';

const blogPosts = [
  {
    slug: 'under-1-second-fast-commerce',
    title: 'Under 1 Second: The Hidden Science of Fast Commerce Sites',
    description: 'Benchmark myths, real metrics, and measuring what actually matters for eCommerce performance.',
    date: 'November 2024',
    readTime: '8 min read',
    category: 'Performance',
  },
  {
    slug: 'remove-drag-f2-car-web-systems',
    title: 'Remove Drag: How We Build Web Systems Like an F2 Car',
    description: 'Performance through elimination and intentional compute. Why less is exponentially more.',
    date: 'November 2024',
    readTime: '6 min read',
    category: 'Architecture',
  },
  {
    slug: 'users-want-less-delay',
    title: "Users Don't Want More Code—They Want Less Delay",
    description: 'The perception of performance, psychology of speed, and why milliseconds matter more than features.',
    date: 'October 2024',
    readTime: '5 min read',
    category: 'UX',
  },
  {
    slug: 'what-99-uptime-means',
    title: 'What 99.99% Uptime Means When Code Actually Goes Fast',
    description: 'Reliability vs performance, real SLA storytelling, and the hidden costs of downtime.',
    date: 'October 2024',
    readTime: '7 min read',
    category: 'Infrastructure',
  },
  {
    slug: 'weightless-architecture',
    title: 'Weightless Architecture: Fewer Parts, Faster Results',
    description: 'Light builds, smart decisions, and low overhead stacks that scale without complexity.',
    date: 'September 2024',
    readTime: '6 min read',
    category: 'Engineering',
  },
];

export default function BlogPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Header */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Engineering Blog
            </div>
            <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Thoughts on{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Performance
              </span>
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Deep dives into speed, architecture, and building systems that don't get in the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className={`group h-full rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50'
                      : 'bg-white border-gray-200 hover:border-blue-500/50 shadow-sm hover:shadow-md'
                  }`}>
                    {/* Category Badge */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                      theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {post.category}
                    </div>

                    {/* Title */}
                    <h2 className={`text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {post.title}
                    </h2>

                    {/* Description */}
                    <p className={`text-sm mb-4 leading-relaxed ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {post.description}
                    </p>

                    {/* Meta */}
                    <div className={`flex items-center gap-4 text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6 text-center">
          <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Ready to build something fast?
          </h3>
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
      </section>
    </div>
  );
}
