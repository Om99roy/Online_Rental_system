import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-bold purple-fade-text mb-2">RentEase</p>
            <p className="text-sm text-text-muted max-w-xs">
              Rent the gear you need, when you need it. No commitment, no
              clutter.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle mb-3">
              Shop
            </p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  to="/products"
                  className="hover:text-primary transition-colors"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-primary transition-colors"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout"
                  className="hover:text-primary transition-colors"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle mb-3">
              Account
            </p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  to="/login"
                  className="hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-primary transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/get-profile"
                  className="hover:text-primary transition-colors"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle mb-3">
              Support
            </p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <a
                  href="mailto:support@rentease.com"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link
                  to="/forgot-password"
                  className="hover:text-primary transition-colors"
                >
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-subtle">
            © {year} RentEase. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-subtle">
            <span className="hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
