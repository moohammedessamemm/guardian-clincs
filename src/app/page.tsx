'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope,
  BriefcaseMedical,
  User,
  Heart,
  Microscope,
  Activity,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-full h-full bg-slate-50 opacity-50" />
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-blue-50/30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/4" />

        <div className="container mx-auto px-6 max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#004b87] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#004b87] animate-pulse" />
              Accepting New Patients
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              World-Class Care, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b87] to-[#00a8e8]">Right Here in Sharm.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Guardian Clinic provides accurate diagnosis and patient-centered care in a modern, safe environment centered on your well-being.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-base bg-[#004b87] hover:bg-[#003865] text-white rounded-full shadow-xl shadow-blue-900/10 group" asChild>
                <Link href="/register">
                  Book an Appointment
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-slate-200 hover:bg-slate-50 text-slate-700" asChild>
                <Link href="#location">
                  View Location
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-8 flex items-center gap-8 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Certified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Advanced Tech</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/20 bg-white">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
              <Image
                src="/images/landing/hero.png"
                alt="Guardian Clinic Doctor"
                width={800}
                height={900}
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-8 -left-8 bg-white p-5 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] max-w-xs z-20 border border-slate-50"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#004b87]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Health Priority</p>
                  <p className="text-sm text-slate-500 leading-snug mt-1">Dedicated to precise diagnosis and effective treatment plans.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Guardian Section */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Why Choose Guardian?</h2>
            <p className="text-slate-500 text-lg">We combine experienced medical professionals with a comfortable, patient-first approach to healthcare.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Microscope,
                title: "Accurate Diagnosis",
                desc: "Effective treatment starts with the right answers. Our experts prioritize precision in every checkup."
              },
              {
                icon: Heart,
                title: "Patient-Centered",
                desc: "Your comfort and trust are our top priority. We listen, explain, and care for you like family."
              },
              {
                icon: Stethoscope,
                title: "Expert Team",
                desc: "Highly qualified medical professionals delivering international standards of care."
              },
              {
                icon: Heart,
                title: "Aesthetic Surgery",
                desc: "Breast Surgery, Breast Lift, Breast Augmentation, Breast Asymmetry"
              },
              {
                icon: BriefcaseMedical,
                title: "Rhinoplasty",
                desc: "Secondary Rhinoplasty, Face Lift, Otoplasty, Vajinoplasty, Labiaplasty, Liposuction, Gynecomastia, Abdominoplasty"
              },
              {
                icon: User,
                title: "Reconstructive Surgery",
                desc: "Cleft Lip and Cleft Plate, Ptosis, Hypospadias, Oral Cancer, Skin Cancer, Microtia"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 group overflow-hidden"
              >
                {/* Hover Background Image */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                  <Image
                    src="/images/landing/doctor-bg.png"
                    alt="Medical Background"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-900/90 mix-blend-multiply" />
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#004b87] flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-[#004b87] transition-colors duration-300">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm group-hover:text-blue-100 transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Break / Care Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/landing/care.png" alt="Patient Care" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#002f55] via-[#004b87]/90 to-[#004b87]/80" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Healing with Compassion</h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-xl">
              We believe that a healing environment is just as important as the medicine itself. Experience a clinic where safety, hygiene, and warmth come together.
            </p>
            <Button variant="outline" className="h-12 border-blue-200 text-blue-50 hover:bg-white hover:text-[#004b87]">
              Learn About Our Values
            </Button>
          </div>
        </div>
      </section >

      {/* Services Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Comprehensive Care</h2>
          <p className="text-xl text-slate-500 font-medium">Coming Soon</p>
        </div>
      </section>

      {/* Location Section */}
      < section id="location" className="py-24 bg-white" >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-[#f8faff] rounded-[3rem] p-8 lg:p-16 border border-blue-50 grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Visit Us in Sharm El Sheikh</h2>
                <p className="text-slate-500 text-lg mb-8">
                  Conveniently located in Genena City, offering easy access and ample parking.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#004b87] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Address</h4>
                    <p className="text-slate-500 mt-1">Above Pinocchio Kids Store, Little Havana Mall,<br />Genena City St, Second Sharm El Sheikh,<br />South Sinai Governorate 46619</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#004b87] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Phone</h4>
                    <p className="text-slate-500 mt-1">011 22742277</p>
                    <p className="text-xs text-slate-400 mt-1">Available 9:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full sm:w-auto bg-[#004b87] hover:bg-[#003865] text-white rounded-full h-12" asChild>
                <Link href="https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUqDAgBEC4YJxivARjHATIGCAAQRRg8MgwIARAuGCcYrwEYxwEyBggCEEUYOzIGCAMQRRg5MgYIBBBFGDwyBggFEEUYPDIGCAYQRRg8MgYIBxBFGDzSAQg4MTM0ajBqN6gCCLACAfEFLWGiASVOzO4&um=1&ie=UTF-8&fb=1&gl=eg&sa=X&geocode=KR0zYCV0OVMUMVjw2run8AY7&daddr=above+Pinocchio+Kids+Store%D8%8C+Little+Havana+Mall%D8%8C+Genena+City+St%D8%8C+%D8%AB%D8%A7%D9%86+%D8%B4%D8%B1%D9%85+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%D8%8C+%D9%85%D8%AD%D8%A7%D9%81%D8%B8%D8%A9+%D8%AC%D9%86%D9%88%D8%A8+%D8%B3%D9%8A%D9%86%D8%A7%D8%A1+46619" target="_blank" rel="noopener noreferrer">
                  Get Directions on Google Maps
                </Link>
              </Button>
            </div>

            {/* Visual Map Placeholder */}
            <div className="relative h-80 lg:h-auto bg-slate-200 rounded-[2rem] overflow-hidden shadow-inner border border-slate-300">
              <iframe
                src="https://maps.google.com/maps?q=Above%20Pinocchio%20Kids%20Store,%20Little%20Havana%20Mall,%20Genena%20City%20St,%20Second%20Sharm%20El%20Sheikh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section >

      {/* CTA / Footer */}
      < footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800" >
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to prioritize your health?</h2>
          <p className="mb-8 max-w-xl mx-auto text-slate-400">Book your appointment today with Guardian Clinic and experience the difference.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button size="lg" className="bg-white text-[#004b87] hover:bg-blue-50 rounded-full font-bold px-8 h-12" asChild>
              <Link href="/register">Book Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-full h-12">
              Contact Us
            </Button>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Guardian Clinics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer >
    </div >
  )
}
