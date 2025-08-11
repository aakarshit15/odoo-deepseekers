"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function VenuesSection() {
  const venues = Array.from({ length: 12 }, (_, i) => i + 1); // Example array with 12 items
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(venues.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return venues.slice(startIndex, endIndex);
  };

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-semibold">Available Venues</h3>
        <a
          href="/venues"
          className="text-[#3498DB] hover:text-[#2C80B4] text-sm sm:text-base"
        >
          See all venues →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {getCurrentPageItems().map((index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#2C2C2C] rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="relative h-40 sm:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden">
              <Image
                src="/images/hero-section-img.png"
                alt="Venue"
                fill
                className="object-cover"
              />
            </div>
            <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
              Sports Complex {index}
            </h4>
            <p className="text-[#636E72] text-xs sm:text-sm mb-3 sm:mb-4">
              123 Sports Street, City
            </p>
            <button className="w-full bg-[#F39C12] hover:bg-[#E67E22] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base transition-colors">
              Book Venue
            </button>
          </div>
        ))}
      </div>
      {venues.length > itemsPerPage && (
        <div className="mt-6 sm:mt-8 flex justify-center">
          <Pagination>
            <PaginationContent className="gap-1 sm:gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={`${
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  } text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-2`}
                />
              </PaginationItem>
              <div className="hidden sm:flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </div>
              <div className="flex sm:hidden items-center">
                <span className="px-2 text-sm text-[#636E72]">
                  {currentPage} / {totalPages}
                </span>
              </div>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={`${
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  } text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-2`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}
