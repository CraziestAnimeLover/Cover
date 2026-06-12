import { FiUsers, FiAward, FiGlobe, FiHeart, FiStar, FiBookOpen, FiTrendingUp } from 'react-icons/fi';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're on a mission to make quality education accessible to everyone, everywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 2024, LMS Platform started with a simple idea: make learning accessible, 
            affordable, and effective. Today, we're proud to serve thousands of students worldwide.
          </p>
          <p className="text-gray-600">
            Our platform combines high-quality video content, expert instructors, and an innovative 
            referral system that rewards learners for sharing knowledge.
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-4">Our Mission</h3>
          <p className="text-gray-600 mb-4">
            To democratize education by providing high-quality, affordable courses and creating 
            opportunities for learners to earn while they learn.
          </p>
          <div className="flex items-center space-x-4 mt-6">
            <FiHeart className="text-3xl text-primary" />
            <span className="text-gray-700">Learn, Grow, Succeed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">10k+</div>
          <p className="text-gray-600">Students</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">100+</div>
          <p className="text-gray-600">Courses</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">50+</div>
          <p className="text-gray-600">Instructors</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">30+</div>
          <p className="text-gray-600">Countries</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Why Students Love Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <FiUsers className="text-3xl text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Expert Instructors</h3>
            <p className="text-gray-600 text-sm">Learn from industry professionals</p>
          </div>
          <div className="text-center">
            <FiAward className="text-3xl text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Quality Content</h3>
            <p className="text-gray-600 text-sm">HD video lectures and resources</p>
          </div>
          <div className="text-center">
            <FiGlobe className="text-3xl text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Global Community</h3>
            <p className="text-gray-600 text-sm">Connect with learners worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;