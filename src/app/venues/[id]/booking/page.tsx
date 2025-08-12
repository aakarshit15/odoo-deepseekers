"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { ArrowLeft, Clock, CreditCard, Loader2, MapPin, Star } from "lucide-react"
import { publicApi } from "@/lib/api"
import { toast } from "sonner"

const timeSlots = [
  "09:00",
  "10:00", 
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

interface Venue {
  id: number
  name: string
  description: string
  city: string
  locality: string
  starting_price_per_hour: string
  rating: number | null
  amenities: string[]
  sports: Array<{ id: number; name: string }>
}

interface Court {
  id: number
  name: string
  sport: string
  price_per_hour: number
}

// Hardcoded Shrimad Sports data
const shrimadSportsData = {
  venue: {
    id: 1,
    name: "Shrimad Sports",
    description: "Premium sports facility with world-class courts and amenities",
    city: "Mumbai",
    locality: "Andheri West",
    starting_price_per_hour: "500",
    rating: 4.8,
    amenities: ["Parking", "Changing Rooms", "Water", "First Aid", "Equipment Rental"],
    sports: [
      { id: 1, name: "Badminton" },
      { id: 2, name: "Tennis" },
      { id: 3, name: "Basketball" }
    ]
  },
  courts: [
    {
      id: 1,
      name: "Badminton Court 1",
      sport: "Badminton",
      price_per_hour: 500
    },
    {
      id: 2,
      name: "Badminton Court 2", 
      sport: "Badminton",
      price_per_hour: 500
    },
    {
      id: 3,
      name: "Tennis Court 1",
      sport: "Tennis", 
      price_per_hour: 800
    },
    {
      id: 4,
      name: "Basketball Court 1",
      sport: "Basketball",
      price_per_hour: 600
    }
  ]
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  
  const venueId = params.id as string
  const [venue, setVenue] = useState<Venue | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [duration, setDuration] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    // Use hardcoded Shrimad Sports data
    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      setVenue(shrimadSportsData.venue)
      setCourts(shrimadSportsData.courts)
      // Auto-select first court
      setSelectedCourt(shrimadSportsData.courts[0])
      setIsLoading(false)
    }, 500)
  }, [venueId])

  const handleCourtSelection = (court: Court) => {
    setSelectedCourt(court)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedCourt) {
      toast.error("Please select date, time, and court for your booking")
      return
    }

    try {
      setIsBooking(true)

      // Prepare booking data
      const bookingData = {
        venue_id: parseInt(venueId),
        court_id: selectedCourt.id,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        duration: duration,
        total_amount: selectedCourt.price_per_hour * duration
      }

      // Redirect to payment gateway
      const paymentUrl = "http://127.0.0.1:8000/api/payment/"
      
      // Create a form to POST the booking data to the payment gateway
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = paymentUrl
      form.target = '_blank' // Open in new tab, or remove this line to redirect in same tab

      // Add booking data as hidden form fields
      Object.entries(bookingData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value.toString()
        form.appendChild(input)
      })

      // Add additional metadata
      const metadataFields = {
        venue_name: venue?.name || '',
        court_name: selectedCourt.name,
        sport: selectedCourt.sport,
        booking_date: selectedDate.toLocaleDateString(),
        booking_time: selectedTime
      }

      Object.entries(metadataFields).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)

      toast.success("Redirecting to payment gateway...")
      
    } catch (error) {
      console.error("Error initiating payment:", error)
      toast.error("Failed to initiate payment. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-green-600">Loading venue details...</p>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-800 mb-4">Venue Not Found</h1>
          <Button onClick={() => router.back()} className="bg-green-600 hover:bg-green-700">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const totalPrice = selectedCourt ? selectedCourt.price_per_hour * duration : 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6 text-green-700 hover:text-green-800 hover:bg-green-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Venue
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Book Your Court</h1>
        <div className="flex items-center gap-2 text-green-600">
          <MapPin className="w-4 h-4" />
          <span>{venue.name} - {venue.city}{venue.locality && `, ${venue.locality}`}</span>
        </div>
        {venue.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm text-green-600">{venue.rating}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Court Selection */}
          {courts.length > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Select Court</CardTitle>
                <CardDescription className="text-green-600">
                  Choose your preferred court
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courts.map((court) => (
                    <Button
                      key={court.id}
                      variant={selectedCourt?.id === court.id ? "default" : "outline"}
                      onClick={() => handleCourtSelection(court)}
                      className={`p-4 h-auto flex flex-col items-start ${
                        selectedCourt?.id === court.id
                          ? "bg-green-600 hover:bg-green-700"
                          : "border-green-300 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      <div className="font-medium">{court.name}</div>
                      <div className="text-sm opacity-80">{court.sport}</div>
                      <div className="text-sm font-medium">₹{court.price_per_hour}/hour</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date Selection */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Select Date</CardTitle>
              <CardDescription className="text-green-600">
                Choose your preferred date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                className="rounded-md border border-green-200"
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Select Time</CardTitle>
              <CardDescription className="text-green-600">
                Available time slots for {selectedDate?.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={
                      selectedTime === time
                        ? "bg-green-600 hover:bg-green-700"
                        : "border-green-300 text-green-700 hover:bg-green-50"
                    }
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duration Selection */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Duration</CardTitle>
              <CardDescription className="text-green-600">
                How long would you like to play?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((hours) => (
                  <Button
                    key={hours}
                    variant={duration === hours ? "default" : "outline"}
                    onClick={() => setDuration(hours)}
                    className={
                      duration === hours
                        ? "bg-green-600 hover:bg-green-700"
                        : "border-green-300 text-green-700 hover:bg-green-50"
                    }
                  >
                    {hours} hour{hours > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div>
          <Card className="border-green-200 sticky top-8">
            <CardHeader>
              <CardTitle className="text-green-800">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Venue:</span>
                  <span className="text-green-800 font-medium">{venue.name}</span>
                </div>
                {selectedCourt && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-green-600">Court:</span>
                      <span className="text-green-800 font-medium">{selectedCourt.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Sport:</span>
                      <span className="text-green-800 font-medium">{selectedCourt.sport}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-green-600">Date:</span>
                  <span className="text-green-800 font-medium">
                    {selectedDate ? selectedDate.toLocaleDateString() : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Time:</span>
                  <span className="text-green-800 font-medium">
                    {selectedTime || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Duration:</span>
                  <span className="text-green-800 font-medium">
                    {duration} hour{duration > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {selectedCourt && (
                <div className="border-t border-green-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Price per hour:</span>
                    <span className="text-green-800">₹{selectedCourt.price_per_hour}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span className="text-green-800">Total:</span>
                    <span className="text-green-800">₹{totalPrice}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !selectedCourt || isBooking}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isBooking ? "Processing..." : `Pay ₹${totalPrice} & Book`}
              </Button>

              <p className="text-xs text-green-600 text-center">
                Secure payment processing. You can cancel up to 2 hours before your booking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}