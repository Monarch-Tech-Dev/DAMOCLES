'use client'

import { motion } from 'framer-motion'
import { ArrowRightIcon, ShieldCheckIcon, SwordIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-damocles-primary via-damocles-secondary to-indigo-900 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-damocles-gold" />
              <span className="text-sm font-semibold text-damocles-gold uppercase tracking-wide">
                DAMOCLES Platform
              </span>
              <SwordIcon className="h-8 w-8 text-damocles-gold" />
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Every User{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-damocles-gold to-yellow-400">
                Protected
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-2">
              Every Violation{' '}
              <span className="text-damocles-gold font-semibold">Recorded</span>
            </p>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-8">
              Every Sword{' '}
              <span className="text-damocles-gold font-semibold">Ready</span>
            </p>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed"
          >
            DAMOCLES transforms individual vulnerability into collective strength. 
            Use GDPR rights, smart contracts, and blockchain technology to combat 
            predatory lending practices in Norway.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-damocles-gold text-damocles-primary font-semibold rounded-lg hover:bg-yellow-400 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Start din beskyttelse
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              href="/how-it-works"
              className="inline-flex items-center px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              Slik fungerer det
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 text-sm text-gray-400"
          >
            <p>Bygget på Cardano • GDPR-kompatibel • Open Source</p>
          </motion.div>
        </div>
        
        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl sm:text-4xl font-bold text-damocles-gold mb-2">
              500k+
            </div>
            <div className="text-gray-300">
              Nordmenn i gjeldsituasjon
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl sm:text-4xl font-bold text-damocles-gold mb-2">
              30-70%
            </div>
            <div className="text-gray-300">
              Ulovlige gebyrer over kostnad
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl sm:text-4xl font-bold text-damocles-gold mb-2">
              100%
            </div>
            <div className="text-gray-300">
              Transparent og demokratisk
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <div className="w-1 h-32 bg-gradient-to-b from-transparent via-damocles-gold to-transparent opacity-50" />
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <div className="w-1 h-32 bg-gradient-to-b from-transparent via-damocles-gold to-transparent opacity-50" />
      </div>
    </section>
  )
}