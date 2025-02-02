'use client';

import { useState } from 'react'
import { Disclosure, Menu } from '@headlessui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../lib/utils'
import { routes } from '@veyla/shared/routes';

const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'Products',
    items: [
      { name: 'Language Models', href: '/products/language-models' },
      { name: 'API Access', href: '/products/api' },
      { name: 'Enterprise Solutions', href: '/products/enterprise' },
    ],
  },
  { name: 'About', href: '/about' },
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Dashboard', href: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard` },
]

export function Navigation() {
  const pathname = usePathname()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault()
      const id = href.replace('/#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState({}, '', href)
      }
    }
  }

  return (
    <Disclosure as="nav" className="fixed w-full bg-black/80 backdrop-blur-md z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200 transition">
                    Veyla AI
                  </Link>
                </div>
                <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  {navigation.map((item) => 
                    'items' in item ? (
                      <Menu as="div" className="relative" key={item.name}>
                        <Menu.Button className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                          {item.name}
                          <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Menu.Button>
                        <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {item.items.map((subItem) => (
                            <Menu.Item key={subItem.name}>
                              {({ active }) => (
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {subItem.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Menu>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={cn(
                          'px-3 py-2 text-sm font-medium rounded-md',
                          pathname === item.href
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        )}
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link
                  href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Try Now
                </Link>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  onClick={(e) => handleNavClick(e as any, item.href)}
                  className={cn(
                    pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
