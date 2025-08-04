import Link from 'next/link';
import Navbar from '@/components/NavBar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import CourseFeatures from '@/components/CourseFeatures';
import AICourseBuilder from '@/components/AICourseBuilder';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero/>
      <HowItWorks/>
      <CourseFeatures/>
      <AICourseBuilder/>
      <Testimonials/>
      <CallToAction/>
      <Footer/>
    </>
  );
}
