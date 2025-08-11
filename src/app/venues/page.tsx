"use client";

import { Input } from "@/components/ui/input";
import VenuesGrid from "../../components/VenuesGrid";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function VenuesPage() {
  const [priceRange, setPriceRange] = useState([500, 2000]);
  const sports = [
    "Basketball",
    "Cricket",
    "Football",
    "Tennis",
    "Swimming",
    "Badminton",
    "Table Tennis",
    "Volleyball",
  ];
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] text-[#2D3436]">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2ECC71]">
              QUICKCOURT
            </h1>
          </div>
        </header>

        <main>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Filters Section */}
            <aside className="w-full sm:w-64 space-y-6 hidden sm:block">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => {
                    setPriceRange([500, 2000]);
                    // Add other filter reset logic here
                  }}
                  className="text-sm text-[#2ECC71] hover:text-[#27AE60] transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Select Sports</h3>
                <Select>
                  <SelectTrigger className="w-full border-[#DADADA]">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sports</SelectLabel>
                      {sports.map((sport) => (
                        <SelectItem key={sport} value={sport.toLowerCase()}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                <div className="space-y-6">
                  <Slider
                    defaultValue={[500, 2000]}
                    min={0}
                    max={5000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="[&_[role=slider]]:bg-[#2ECC71]"
                  />
                  <div className="flex justify-between text-sm text-[#636E72]">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Venue Type</h3>
                <div className="space-y-2">
                  {["Indoor", "Outdoor"].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-[#DADADA] text-[#2ECC71] focus:ring-[#2ECC71]"
                      />
                      <span className="text-sm text-[#2D3436] dark:text-gray-300">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Rating</h3>
                <div className="space-y-2">
                  {[
                    "⭐⭐⭐⭐⭐ 5.0",
                    "⭐⭐⭐⭐ 4.0+",
                    "⭐⭐⭐ 3.0+",
                    "⭐⭐ 2.0+",
                    "⭐ 1.0+",
                  ].map((rating) => (
                    <label key={rating} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="rating"
                        className="border-[#DADADA] text-[#2ECC71] focus:ring-[#2ECC71]"
                      />
                      <span className="text-sm text-[#2D3436] dark:text-gray-300">
                        {rating}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  // Add apply filters logic here
                }}
                className="w-full mt-6 bg-[#2ECC71] hover:bg-[#27AE60] text-white py-2 px-4 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </aside>

            {/* Mobile Filter Button */}
            <div className="sm:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full bg-white dark:bg-[#2C2C2C] text-[#2D3436] dark:text-white px-4 py-2 rounded-lg border border-[#DADADA] flex items-center justify-between">
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      Filters
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full sm:w-[540px] bg-[#F9FAFB] dark:bg-[#1E1E1E] p-0 flex flex-col"
                >
                  <div className="p-6 border-b border-[#DADADA] dark:border-gray-700">
                    <SheetHeader>
                      <div className="flex justify-between items-center">
                        <SheetTitle className="text-[#2D3436] dark:text-white">
                          Filters
                        </SheetTitle>
                        <button
                          onClick={() => {
                            setPriceRange([500, 2000]);
                            // Add other filter reset logic here
                          }}
                          className="text-sm text-[#2ECC71] hover:text-[#27AE60] transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </SheetHeader>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Filter content - same as sidebar */}
                    <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">
                        Select Sports
                      </h3>
                      <Select>
                        <SelectTrigger className="w-full border-[#DADADA]">
                          <SelectValue placeholder="Select a sport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Sports</SelectLabel>
                            {sports.map((sport) => (
                              <SelectItem
                                key={sport}
                                value={sport.toLowerCase()}
                              >
                                {sport}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">
                        Price Range
                      </h3>
                      <div className="space-y-6">
                        <Slider
                          defaultValue={[500, 2000]}
                          min={0}
                          max={5000}
                          step={100}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="[&_[role=slider]]:bg-[#2ECC71]"
                        />
                        <div className="flex justify-between text-sm text-[#636E72]">
                          <span>₹{priceRange[0]}</span>
                          <span>₹{priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Venue Type</h3>
                      <div className="space-y-2">
                        {["Indoor", "Outdoor"].map((type) => (
                          <label
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-[#DADADA] text-[#2ECC71] focus:ring-[#2ECC71]"
                            />
                            <span className="text-sm text-[#2D3436] dark:text-gray-300">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Rating</h3>
                      <div className="space-y-2">
                        {["⭐⭐⭐⭐⭐ 5.0", "⭐⭐⭐⭐ 4.0+", "⭐⭐⭐ 3.0+"].map(
                          (rating) => (
                            <label
                              key={rating}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name="rating"
                                className="border-[#DADADA] text-[#2ECC71] focus:ring-[#2ECC71]"
                              />
                              <span className="text-sm text-[#2D3436] dark:text-gray-300">
                                {rating}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 mt-auto border-t border-[#DADADA] dark:border-gray-700">
                    <button
                      onClick={() => {
                        // Add apply filters logic here
                        const sheet = document.querySelector(
                          '[data-state="open"]'
                        );
                        if (sheet) {
                          (
                            sheet.querySelector(
                              'button[type="button"]'
                            ) as HTMLButtonElement
                          )?.click();
                        }
                      }}
                      className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search venues..."
                    className="w-full border-[#DADADA] rounded-lg pr-10"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-[#636E72]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Venues Grid with Pagination */}
              <VenuesGrid itemsPerPage={12} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
