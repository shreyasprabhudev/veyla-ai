"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "./button"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

// Dashboard navigation
export function Navigation() {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-20 max-w-screen-2xl items-center">
        <NavigationMenu>
          <NavigationMenuList className="h-20">
            <NavigationMenuItem className="mr-8">
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10">
                      <div className="absolute inset-0 rounded-xl bg-primary-700/20" />
                      <div className="absolute inset-0.5 rounded-lg bg-background flex items-center justify-center">
                        <span className="text-xl font-bold text-primary-600">V</span>
                      </div>
                    </div>
                    <span className="hidden text-lg font-bold text-primary-600 sm:inline-block">
                      Veyla AI
                    </span>
                  </div>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href} className="px-2">
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <span className="text-base">{item.label}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-auto flex items-center space-x-6">
          <ThemeToggle />
          <Button 
            variant="default" 
            size="lg"
            className="bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-300"
          >
            Get Started
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
