import { useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavbarColorContext, NavbarContext } from "../store/NavContext.tsx";
import { useAuthStore } from "../store/AuthContext.tsx";
import { useCartStore } from "../store/CartStore.ts";
import { useDebounce } from "../hooks/useDebounce";
import { useEffect, useState } from "react";
import logo from "../assets/orBIS.png";

interface NavbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const Navbar = ({ searchValue = "", onSearchChange }: NavbarProps) => {
  const navGreenRef = useRef<HTMLDivElement | null>(null);
  const navContext = useContext(NavbarContext);
  const navColorContext = useContext(NavbarColorContext);
  if (!navContext || !navColorContext)
    throw new Error("Nav contexts must be used within providers");
  const [, setNavOpen] = navContext;

  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const itemCount = useCartStore((state) => state.totalItems());

  const isProductsPage = location.pathname === "/products";
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    if (isProductsPage && onSearchChange) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, isProductsPage]);

  const initials = user
    ? `${user.firstName?.[0] ?? user.username[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : null;

  return (
    <div className="z-40 flex fixed top-0 w-full items-center justify-between bg-background/80 backdrop-blur-md px-4 lg:px-10 py-3">
      <div className="lg:w-28 w-15 h-auto flex-shrink-0">
        <img
          src={logo}
          alt="Logo"
          className="w-28 lg:w-36 h-auto object-contain"
        />
      </div>

      {isProductsPage && (
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-surface-2 border border-border placeholder:text-text-subtle rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Cart icon with badge */}
        <button
          onClick={() => navigate("/cart")}
          className="relative w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
          aria-label="Cart"
        >
          <svg
            className="w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] flex items-center justify-center px-1">
              {itemCount}
            </span>
          )}
        </button>

        {/* Profile icon */}
        {user ? (
          <button
            onClick={() => navigate("/get-profile")}
            className="w-10 h-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold hover:bg-primary/25 transition-colors"
            aria-label="Profile"
          >
            {initials}
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-text-muted hover:text-text transition-colors px-3"
          >
            Login
          </button>
        )}

        {/* Hamburger — opens FullScreenNav */}
        <div
          onClick={() => setNavOpen(true)}
          onMouseEnter={() => {
            if (navGreenRef.current) navGreenRef.current.style.height = "100%";
          }}
          onMouseLeave={() => {
            if (navGreenRef.current) navGreenRef.current.style.height = "0%";
          }}
          className="h-10 lg:h-12 bg-black relative w-16 lg:w-20 rounded-full overflow-hidden"
        >
          <div
            ref={navGreenRef}
            className="bg-primary transition-all absolute top-0 h-0 w-full"
          />
          <div className="cursor-pointer relative h-full px-6 flex flex-col justify-center items-end gap-1">
            <div className="w-6 h-0.5 bg-white" />
            <div className="w-4 h-0.5 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
