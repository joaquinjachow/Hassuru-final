import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const navigation = [
    { name: "Zapatillas", href: "/productos/categoria/zapatillas" },
    { name: "Ropa", href: "/productos/categoria/ropa" },
    { name: "Tecnología", href: "/productos/categoria/accesorios" },
    { name: "Encargos", href: "/encargos" },
  ];

  return (
    <>
      <nav className="relative p-12 shadow-md">
        <div className="absolute inset-0 w-full h-full">
          <Link href="/">
            <Image
              src={isMobile ? "/banner-3.png" : "/banner-3.png"}
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              priority={true}
              sizes="(max-width: 768px) 100vw, 1200px"
              unoptimized={true}
            />
          </Link>
        </div>
      </nav>
      <nav className="relative p-2 bg-white shadow-md">
        <div className="container flex items-center mx-auto">
          <div className="justify-start flex-grow hidden xl:flex xl:items-center xl:space-x-6">
            <ul className="flex flex-row space-x-6">
              {navigation.map((menu) => (
                <li key={menu.name}>
                  <Link
                    href={menu.href}
                    className="px-4 py-2 text-lg font-medium text-black no-underline rounded-md hover:bg-black hover:text-white focus:outline-none"
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden ml-auto xl:block">
            <SearchBar onSearch={(query) => console.log(query)} isHamburgerOpen={false} />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto text-black focus:outline-none xl:hidden"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        {isOpen && (
          <div className="mt-8 xl:hidden">
            <ul className="space-y-4">
              {navigation.map((menu) => (
                <li key={menu.name}>
                  <Link
                    href={menu.href}
                    className="block px-4 py-2 text-lg font-medium text-black no-underline rounded-md hover:bg-black hover:text-white"
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
              <li>
                <SearchBar onSearch={(query) => console.log(query)} isHamburgerOpen={isOpen} />
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
