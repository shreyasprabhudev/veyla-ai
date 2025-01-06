import { Button } from '@/components/ui/button';
import { ShieldCheckIcon, LockClosedIcon, SparklesIcon, UserIcon, StarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Navbar } from '@/app/components/Navbar';
import { HeroButtons } from '@/app/components/HeroButtons';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <main className="relative isolate">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-600 to-purple-800 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Privacy-First AI Interactions
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Protect your sensitive information while leveraging the power of AI. OpaqueAI ensures your data stays private and secure.
            </p>
            <HeroButtons />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Why Choose OpaqueAI?
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  title: 'Local Processing',
                  description: 'Process sensitive data locally without external API calls',
                  icon: ShieldCheckIcon,
                },
                {
                  title: 'HIPAA Compliant',
                  description: 'Built-in privacy preservation mechanisms for healthcare data',
                  icon: LockClosedIcon,
                },
                {
                  title: 'Smart Detection',
                  description: 'Automatically detect and protect sensitive information',
                  icon: SparklesIcon,
                },
              ].map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <div className="mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-auto flex-col">
                    <h3 className="text-xl font-semibold leading-8 text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 flex flex-auto text-base leading-7 text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-24 sm:py-32 bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Trusted by Industry Leaders
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              See what our customers are saying about OpaqueAI
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: 'Sarah Johnson',
                role: 'CTO at HealthTech',
                text: 'OpaqueAI has transformed how we handle sensitive patient data. The privacy-first approach gives us peace of mind.',
              },
              {
                name: 'Michael Chen',
                role: 'Lead Developer at SecureFinance',
                text: 'The local processing capabilities are impressive. We can now use AI without compromising our security standards.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Privacy Officer at DataCorp',
                text: 'Finally, an AI solution that takes privacy seriously. The automatic sensitive data detection is a game-changer.',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="flex flex-col justify-between bg-gray-900 px-6 py-8 rounded-2xl">
                <div>
                  <div className="flex items-center gap-x-4">
                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-8 tracking-tight text-white">{testimonial.name}</h3>
                      <p className="text-base leading-7 text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mt-8 text-base leading-7 text-gray-300">{testimonial.text}</p>
                </div>
                <div className="mt-8 flex items-center gap-x-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-purple-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Choose the plan that's right for you
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '$49',
                description: 'Perfect for small teams and startups',
                features: ['Up to 5 users', '10GB secure storage', 'Basic support', 'Local processing'],
              },
              {
                name: 'Professional',
                price: '$99',
                description: 'For growing businesses',
                features: ['Up to 20 users', '50GB secure storage', 'Priority support', 'Advanced analytics'],
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: ['Unlimited users', 'Unlimited storage', '24/7 support', 'Custom features'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="flex flex-col justify-between rounded-3xl bg-gray-900 px-8 py-10"
              >
                <div>
                  <h3 className="text-lg font-semibold leading-8 text-white">{plan.name}</h3>
                  <p className="mt-4 text-sm leading-6 text-gray-300">{plan.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-sm font-semibold leading-6 text-gray-300">/month</span>}
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CurrencyDollarIcon className="h-6 w-5 flex-none text-purple-400" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  href="/dashboard"
                  className="mt-8 w-full bg-purple-600 hover:bg-purple-700"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
