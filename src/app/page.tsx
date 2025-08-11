import { Input } from "@/components/ui/input";
import VenuesSection from "@/components/VenuesSection";
import { Navigation } from "@/components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] text-[#2D3436]">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <main>
          <section className="mb-8 sm:mb-12">
            <div className="flex flex-col justify-center items-center sm:items-start gap-2 w-full">
              <div className="w-full sm:max-w-md">
                <Input
                  type="text"
                  placeholder="Enter location..."
                  className="w-full border-[#DADADA] rounded-lg text-sm sm:text-base"
                />
              </div>
              <button className="w-full sm:max-w-md bg-[#2ECC71] hover:bg-[#27AE60] text-white px-4 py-2 rounded cursor-pointer hover:scale-98 text-sm sm:text-base">
                Search
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 mt-6 text-center sm:text-left">
              FIND PLAYERS & VENUES NEARBY
            </h2>
            <p className="text-[#636E72] mb-4 sm:mb-6 text-sm sm:text-base text-center sm:text-left max-w-2xl">
              Seamlessly explore sports venues and play with other sports
              enthusiasts near you!
            </p>
          </section>

          <VenuesSection />

          <section className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center sm:text-left">
              Popular Sports
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 px-2 sm:px-0">
              {[
                "Basketball",
                "Football",
                "Tennis",
                "Swimming",
                "Cricket",
                "Table Tennis",
              ].map((sport) => (
                <div
                  key={sport}
                  className="bg-white dark:bg-[#2C2C2C] rounded-lg shadow-sm p-3 sm:p-4 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-[#A3E4D7] rounded-full flex items-center justify-center">
                    {/* Sport icon would go here */}
                  </div>
                  <p className="font-medium text-sm sm:text-base">{sport}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="text-center text-[#636E72] mt-8 sm:mt-12 text-sm sm:text-base">
          <p>© 2025 QuickCourt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
