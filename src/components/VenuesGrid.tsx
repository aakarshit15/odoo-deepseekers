"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface VenuesGridProps {
  itemsPerPage: number;
}

export default function VenuesGrid({ itemsPerPage }: VenuesGridProps) {
  // Example venues array - replace with actual data
  const venues = Array.from({ length: 50 }, (_, i) => i + 1);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(venues.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return venues.slice(startIndex, endIndex);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="absolute top-2 right-2 bg-white dark:bg-[#2C2C2C] px-2 py-1 rounded text-sm">
                ⭐ 4.5
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm sm:text-base">
                Sports Complex {index}
              </h4>
              <p className="text-[#636E72] text-xs sm:text-sm">
                123 Sports Street, City
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[#A3E4D7] text-[#2D3436] px-2 py-1 rounded">
                  Indoor
                </span>
                <span className="text-xs bg-[#A3E4D7] text-[#2D3436] px-2 py-1 rounded">
                  Cricket
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <div>
                  <span className="text-[#636E72] text-xs">Starting from</span>
                  <p className="font-semibold text-sm sm:text-base">₹500/hr</p>
                </div>
                <button className="bg-[#F39C12] hover:bg-[#E67E22] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm transition-colors">
                  Book Now
                </button>
              </div>
            </div>
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
    </div>
  );
}
