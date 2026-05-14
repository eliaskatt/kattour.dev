(() => {
  const snippets = {
    'code-hero': `module HeroSection {
  type "marketing-banner"
  title "Build Your Next Project Faster"
  subtitle "Kattour UI provides beautiful responsive modules to accelerate your development workflow."

  actions {
    button "Get Started" href "#modules" variant "primary"
    button "Learn More" href "#about" variant "secondary"
  }
}`,
    'code-login': `module LoginForm {
  type "authentication-login"

  fields {
    input "Email Address" name "email" type "email" placeholder "you@example.com"
    input "Password" name "password" type "password"
  }

  actions {
    submit "Sign In" variant "primary-full"
    link "Forgot password?" href "#"
  }
}`,
    'code-product': `module ProductCard {
  type "product"
  image "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  category "Electronics"
  name "Wireless Noise-Cancelling Headphones"
  price "$199.00"
  rating 4.5
  reviews 117

  action "Add to cart" variant "primary-full"
}`,
    'code-navbar': `module Navbar {
  type "header-bar"
  sticky true
  responsive true

  brand "KattourUI" href "#"

  links {
    link "Modules" href "#"
    link "Docs" href "#"
    link "Company" href "#"
  }

  action "Log in" href "#"
}`,
    'code-alert': `module Notification {
  type "alert"
  status "success"
  icon "check-circle"
  title "Order Completed"
  message "Your order #12345 has been processed successfully."
  dismissible true
}`,
    'code-pricing': `module PricingCard {
  type "pricing-tier"
  plan "Pro"
  price "$49"
  frequency "/month"
  description "Advanced features for professionals and teams."
  featured true

  features {
    item "All features in Basic"
    item "Advanced analytics"
    item "10 team members"
    item "Priority support"
  }

  action "Choose Plan" variant "primary"
}`,
    'code-search': `module SearchInput {
  type "search"
  label "Search"
  placeholder "Search for modules..."
  icon "magnifying-glass"
  action "Search"
}`,
    'code-tabs': `module Tabs {
  default "profile"

  tab "profile" label "Profile" {
    text "User profile information goes here..."
  }

  tab "dashboard" label "Dashboard" {
    text "Analytics and dashboard widgets..."
  }

  tab "settings" label "Settings" {
    text "Account and application settings..."
  }
}`,
    'code-dashboard': `module DashboardOverview {
  stats {
    stat "Revenue" "$48.2K" trend "+12%"
    stat "Orders" "1,284" trend "+8%"
    stat "Users" "9.7K" trend "+21%"
  }

  chart "Revenue" type "line"
}`,
    'code-testimonial': `module TestimonialCard {
  quote "Kattour made UI prototyping incredibly fast."
  author "Sarah Chen"
  role "Product Designer"
  rating 5
}`,
    'code-footer': `module Footer {
  brand "Kattour"
  description "Build interfaces with clarity."

  columns {
    group "Product" { link "Modules" link "Docs" link "Playground" }
    group "Company" { link "About" link "Contact" }
  }
}`,
    'code-stats': `module StatsSection {
  stat "Modules" "20+"
  stat "Templates" "50+"
  stat "Build speed" "3x"
}`,
    'code-cta': `module CTASection {
  title "Ready to build faster?"
  subtitle "Start with Kattour modules and ship modern interfaces quickly."
  button "Open Playground" href "playground.html" variant "primary"
}`
  };

  for (const [id, code] of Object.entries(snippets)) {
    const el = document.getElementById(id);
    if (el) el.textContent = code;
  }

  const homeCode = document.querySelector('main pre code');
  if (homeCode && !homeCode.id) {
    homeCode.textContent = `page Home

state user = "Elias"

route "/" {
  section {
    title "Welcome, $user"
    text "Build interfaces with clarity."

    button "Open Playground" {
      click navigate("/playground")
    }
  }
}`;
  }
})();
