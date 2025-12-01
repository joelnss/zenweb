'use client';

import { motion } from 'framer-motion';
import { slideInLeft, slideInRight } from '@/lib/animations/variants';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
            className="space-y-6"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Eliminate spreadsheets with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                CoverIT™ Platform
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Choose from a suite of P.C. Resource software solutions purpose-built
              by IT asset management experts to fit with the tools you already own.
            </p>

            <div className="flex gap-4 pt-4">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                Build Your Plan
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right: Screenshot/Dashboard Preview */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              {/* Dashboard Preview Placeholder */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded" />
                    <div className="w-20 h-2 bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                    <div className="w-16 h-2 bg-gray-300 rounded mb-2" />
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded" />
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="w-16 h-2 bg-gray-300 rounded mb-2" />
                    <div className="w-12 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded" />
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-4 h-48 flex items-end gap-2">
                  {[40, 70, 50, 80, 60, 90, 75].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                {/* List Items */}
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded" />
                      <div className="flex-1 space-y-1">
                        <div className="w-32 h-2 bg-gray-300 rounded" />
                        <div className="w-24 h-2 bg-gray-200 rounded" />
                      </div>
                      <div className="w-16 h-6 bg-green-100 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
