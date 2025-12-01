'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/theme-context';

const computeServices = [
  {
    name: 'Amazon EC2',
    subtitle: 'Elastic Compute Cloud',
    description: 'Highly configurable virtual machines (Intel, AMD, ARM/Graviton). Auto Scaling groups for horizontal elasticity. Spot Instances for up to 90% cost savings.',
    useCase: 'Web apps, backend APIs, containers, and batch processing.',
  },
  {
    name: 'AWS Lambda',
    subtitle: 'Serverless Compute',
    description: 'Event-driven functions with zero server management. Millisecond billing.',
    useCase: 'Microservices, automation triggers, lightweight APIs, and event pipelines.',
  },
  {
    name: 'AWS ECS / EKS',
    subtitle: 'Containers Done Right',
    description: 'ECS for simple, scalable container orchestration. EKS for full Kubernetes workloads. Integrates with ALB, CloudMap, and secure IAM roles per task/pod.',
    useCase: 'Container orchestration at scale.',
  },
];

const networkingServices = [
  {
    name: 'Elastic Load Balancing',
    subtitle: 'ELB',
    features: [
      'ALB (Application Load Balancer): Layer 7 routing, path rules, sticky sessions, WebSockets',
      'NLB (Network Load Balancer): Direct L4 performance at millions of requests/sec',
      'GLB (Gateway Load Balancer): Insert firewalls, proxies, and appliances at enterprise scale',
    ],
  },
  {
    name: 'Amazon Route 53',
    subtitle: 'Global DNS',
    features: [
      'Sub-30ms DNS resolution worldwide',
      'Health checks + failover routing',
      'Latency-based and geolocation routing for global apps',
    ],
  },
  {
    name: 'Amazon CloudFront',
    subtitle: 'CDN Acceleration',
    features: [
      'Edge caching + edge compute (Lambda@Edge)',
      'Global points-of-presence for ultra-low latency content delivery',
    ],
  },
];

const storageServices = [
  {
    name: 'Amazon S3',
    subtitle: 'Industry-Leading Object Storage',
    highlight: '99.999999999% durability',
    features: [
      'Lifecycle tiers: Standard, IA, Glacier, Deep Archive',
      'Versioning, replication, encryption, and bucket-level policies',
    ],
  },
  {
    name: 'Amazon EBS',
    subtitle: 'Elastic Block Store',
    features: [
      'High-IOPS SSD volumes for databases and critical transactional systems',
      'Snapshots for instant backup',
    ],
  },
  {
    name: 'Amazon EFS',
    subtitle: 'Elastic File System',
    features: [
      'Fully managed NFS storage',
      'Designed for multi-AZ access and large-scale analytics workloads',
    ],
  },
];

const databaseServices = [
  {
    name: 'Amazon RDS',
    subtitle: 'Managed Relational Databases',
    features: [
      'Supports MySQL, Postgres, MariaDB, Oracle, SQL Server',
      'Automated backups, read replicas, Multi-AZ failover',
    ],
  },
  {
    name: 'Amazon DynamoDB',
    subtitle: 'NoSQL at Hyperscale',
    highlight: 'Single-digit ms performance',
    features: [
      'Auto scaling, global tables, streams for CDC (change data capture)',
    ],
  },
  {
    name: 'Amazon Redshift',
    subtitle: 'Cloud Data Warehouse',
    features: [
      'Columnar storage, MPP, advanced query optimization',
      'Perfect for BI reporting and analytics',
    ],
  },
];

const securityServices = [
  {
    name: 'AWS IAM',
    subtitle: 'Identity & Access Management',
    features: [
      'Fine-grained role-based access',
      'MFA, Access Analyzer, cross-account roles',
    ],
  },
  {
    name: 'AWS WAF & Shield',
    subtitle: 'Web Application Firewall',
    features: [
      'Protects against SQL injection, XSS, DDoS, and common attack vectors',
      'Managed rule sets simplify enterprise security',
    ],
  },
  {
    name: 'AWS Security Hub',
    subtitle: 'Centralized Security',
    features: [
      'Centralized security posture management',
      'Integrates with GuardDuty, Inspector, Macie, and third-party tools',
    ],
  },
];

const devopsServices = [
  {
    name: 'Amazon CloudWatch',
    subtitle: 'Observability',
    features: ['Real-time logs, metrics, alarms, dashboards'],
  },
  {
    name: 'AWS CodePipeline / CodeBuild / CodeDeploy',
    subtitle: 'CI/CD',
    features: ['Fully managed CI/CD for containerized and serverless workloads'],
  },
  {
    name: 'AWS CloudTrail',
    subtitle: 'Audit & Compliance',
    features: ['Every API call recorded, auditable, and traceable'],
  },
];

const architectureBlueprint = [
  { service: 'Route 53', description: 'DNS' },
  { service: 'CloudFront', description: 'CDN edge caching' },
  { service: 'ALB', description: 'Layer 7 routing' },
  { service: 'ECS on Fargate', description: 'Serverless containers' },
  { service: 'RDS', description: 'Relational database' },
  { service: 'ElastiCache Redis', description: 'Caching layer' },
  { service: 'S3', description: 'Static asset storage' },
  { service: 'CloudWatch', description: 'Logs + metrics' },
  { service: 'IAM + WAF', description: 'Security' },
];

const technicalHighlights = [
  'Zero servers to patch',
  'Auto-scaling containers on demand',
  'Database multi-AZ failover',
  'CDN-accelerated global delivery',
  'Fully encrypted at transit & rest',
  'Observability out-of-the-box',
];

const whyAwsReasons = [
  { title: 'High Performance', description: 'Compute, databases, and edge services optimized for low latency.' },
  { title: 'Global Scale', description: 'Deploy to 30+ regions worldwide with a single click.' },
  { title: 'Pay-as-you-go', description: 'Only pay for what you use—scale down costs as easily as scaling up.' },
  { title: 'Enterprise Security', description: 'SOC 1/2/3, PCI DSS, HIPAA, and FedRAMP compliant infrastructure.' },
];

export default function AWSServicesPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-orange-600/10' : 'bg-orange-200/30'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-yellow-600/10' : 'bg-yellow-200/20'}`} style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-orange-100 border border-orange-200 text-orange-700'
            }`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.75 11.35a4.32 4.32 0 01-.79-.08 3.55 3.55 0 01-.73-.21l-.17-.09-.14-.08a3 3 0 01-.31-.21 3.65 3.65 0 01-.23-.2 3 3 0 01-.2-.2l-.17-.18a3.83 3.83 0 01-.27-.35l-.06-.09-.06-.1a3.27 3.27 0 01-.15-.27 2.9 2.9 0 01-.15-.34 3.7 3.7 0 01-.1-.28l-.07-.28a3.9 3.9 0 01-.06-.37v-.31a5.51 5.51 0 010-.67 4 4 0 01.07-.54 3.4 3.4 0 01.1-.44 3.13 3.13 0 01.17-.45l.1-.2.08-.15a3.77 3.77 0 01.47-.66l.14-.15.12-.11.15-.13a3 3 0 01.24-.18 3.22 3.22 0 01.28-.17l.21-.1.14-.06a4.85 4.85 0 011.38-.31h.32a5.42 5.42 0 011.43.23 3.6 3.6 0 01.44.17l.21.1a3.65 3.65 0 01.28.17 2.32 2.32 0 01.23.17l.16.14.12.11.14.15a3.77 3.77 0 01.47.66l.08.15.1.2a3.13 3.13 0 01.17.45 3.4 3.4 0 01.1.44 4 4 0 01.07.54 5.51 5.51 0 010 .67v.31a3.9 3.9 0 01-.06.37l-.07.28a3.7 3.7 0 01-.1.28 2.9 2.9 0 01-.15.34 3.27 3.27 0 01-.15.27l-.06.1-.06.09a3.83 3.83 0 01-.27.35l-.17.18a3 3 0 01-.2.2 3.65 3.65 0 01-.23.2 3 3 0 01-.31.21l-.14.08-.17.09a3.55 3.55 0 01-.73.21 4.32 4.32 0 01-.79.08z"/>
              </svg>
              AWS Cloud Services
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Accelerate Your Stack With{' '}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Proven AWS Cloud Services</span>
            </h1>

            <p className={`text-lg sm:text-xl max-w-3xl mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Deliver faster. Scale instantly. Build smarter. These are the AWS services trusted by millions—and essential for any modern digital platform.
            </p>

            <p className={`text-base max-w-2xl mx-auto mb-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              A lightweight, high-performance cloud foundation built with the smallest moving parts possible—scalable, resilient, and engineered for velocity.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/start-project"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg shadow-orange-500/25"
              >
                Start Building
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/portal"
                className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Architecture Review
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compute Services */}
      <section className="relative py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                1. Compute Services
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {computeServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                } transition-all`}
              >
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </h3>
                <p className="text-orange-500 text-sm font-medium mb-3">{service.subtitle}</p>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service.description}
                </p>
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`text-xs uppercase tracking-wider font-medium mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Best For
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {service.useCase}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Networking & Load Balancing */}
      <section className={`relative py-16 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                2. Networking & Load Balancing
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {networkingServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                } transition-all`}
              >
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </h3>
                <p className="text-blue-500 text-sm font-medium mb-4">{service.subtitle}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Storage & Backup */}
      <section className="relative py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                3. Storage & Backup
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {storageServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                } transition-all`}
              >
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </h3>
                <p className="text-green-500 text-sm font-medium mb-2">{service.subtitle}</p>
                {service.highlight && (
                  <div className={`inline-block px-2 py-1 rounded text-xs font-mono mb-3 ${
                    theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    {service.highlight}
                  </div>
                )}
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Databases & Data Services */}
      <section className={`relative py-16 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                4. Databases & Data Services
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {databaseServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                } transition-all`}
              >
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </h3>
                <p className="text-purple-500 text-sm font-medium mb-2">{service.subtitle}</p>
                {service.highlight && (
                  <div className={`inline-block px-2 py-1 rounded text-xs font-mono mb-3 ${
                    theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {service.highlight}
                  </div>
                )}
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security, Identity & Compliance */}
      <section className="relative py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                5. Security, Identity & Compliance
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {securityServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                } transition-all`}
              >
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </h3>
                <p className="text-red-500 text-sm font-medium mb-4">{service.subtitle}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DevOps, CI/CD & Observability */}
      <section className={`relative py-16 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                6. DevOps, CI/CD & Observability
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {devopsServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border p-6 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                } transition-all`}
              >
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </h3>
                <p className="text-cyan-500 text-sm font-medium mb-4">{service.subtitle}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Blueprint */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Architecture Example:{' '}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Lightweight, High-Performance Web Stack
              </span>
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Purpose: minimal moving parts, maximum performance.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Blueprint Flow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`rounded-2xl border p-8 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
              }`}
            >
              <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Core Blueprint
              </h3>
              <div className="space-y-3">
                {architectureBlueprint.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-bold ${
                      theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.service}
                      </span>
                      <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>→</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Technical Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`rounded-2xl border p-8 ${
                theme === 'dark' ? 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
              }`}
            >
              <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Technical Highlights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {technicalHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why People Love AWS */}
      <section className={`relative py-20 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Why People Love AWS
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyAwsReasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border p-6 text-center ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                  theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {reason.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {reason.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative overflow-hidden rounded-3xl p-12 text-center ${
              theme === 'dark' ? 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/20' : 'bg-gradient-to-br from-orange-500 to-yellow-500'
            }`}
          >
            <div className="relative z-10">
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                Ready to Build on AWS?
              </h2>
              <p className={`mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-white/90'}`}>
                Let us architect a scalable, secure, and cost-efficient AWS infrastructure tailored to your business needs.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/start-project"
                  className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-white text-orange-600 hover:bg-gray-100'
                  }`}
                >
                  Start Building
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/portal"
                  className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  Get Architecture Review
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
