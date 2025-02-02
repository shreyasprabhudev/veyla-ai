export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">About Veyla AI</h1>
        <div className="prose prose-invert">
          <p className="text-lg mb-6">
            Veyla AI is at the forefront of AI innovation, developing cutting-edge language models and AI solutions that empower businesses and developers to build the next generation of intelligent applications.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="mb-6">
            We're on a mission to democratize access to advanced AI technologies, making it easier for organizations of all sizes to leverage the power of artificial intelligence in their applications and workflows.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
          <p className="mb-6">
            Our team consists of world-class AI researchers, engineers, and industry veterans who are passionate about pushing the boundaries of what's possible with AI technology.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Innovation: Constantly pushing the boundaries of AI technology</li>
            <li>Reliability: Building robust and dependable AI solutions</li>
            <li>Security: Maintaining the highest standards of data protection</li>
            <li>Transparency: Being open about our technology and practices</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="mb-6">
            We'd love to hear from you! Reach out to us at contact@veylaai.com to learn more about our products and services.
          </p>
        </div>
      </div>
    </div>
  );
}
