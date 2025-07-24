"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
  format?: string
  maxLength?: number
}

const countries: Country[] = [
  { code: "BR", name: "Brasil", dialCode: "+55", flag: "🇧🇷", format: "(##) #####-####", maxLength: 11 },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", format: "(###) ###-####", maxLength: 10 },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷", format: "## ####-####", maxLength: 10 },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱", format: "# ####-####", maxLength: 9 },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴", format: "### ###-####", maxLength: 10 },
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽", format: "## ####-####", maxLength: 10 },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪", format: "### ###-###", maxLength: 9 },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾", format: "#### ####", maxLength: 8 },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾", format: "### ###-###", maxLength: 9 },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴", format: "#### ####", maxLength: 8 },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨", format: "## ###-####", maxLength: 9 },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪", format: "###-###-####", maxLength: 10 },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹", format: "### ### ###", maxLength: 9 },
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸", format: "### ### ###", maxLength: 9 },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", format: "## ## ## ## ##", maxLength: 10 },
  { code: "IT", name: "Italia", dialCode: "+39", flag: "🇮🇹", format: "### ### ####", maxLength: 10 },
  { code: "DE", name: "Deutschland", dialCode: "+49", flag: "🇩🇪", format: "#### #######", maxLength: 11 },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", format: "#### ### ####", maxLength: 10 },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", format: "(###) ###-####", maxLength: 10 },
]

interface CountryPhoneInputProps {
  value: string
  onChange: (value: string, country: Country, isValid: boolean) => void
  placeholder?: string
  className?: string
}

export function CountryPhoneInput({ value, onChange, placeholder, className }: CountryPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0])
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  const formatPhoneNumber = (number: string, country: Country) => {
    const cleaned = number.replace(/\D/g, "")
    const maxLength = country.maxLength || 10
    const truncated = cleaned.slice(0, maxLength)

    if (country.code === "BR") {
      if (truncated.length >= 11) {
        return truncated.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
      } else if (truncated.length >= 10) {
        return truncated.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
      } else if (truncated.length >= 6) {
        return truncated.replace(/(\d{2})(\d{4})(\d*)/, "($1) $2-$3")
      } else if (truncated.length >= 2) {
        return truncated.replace(/(\d{2})(\d*)/, "($1) $2")
      }
    }

    return truncated
  }

  const isValidPhoneNumber = (number: string, country: Country) => {
    const cleaned = number.replace(/\D/g, "")
    const minLength = Math.max(8, (country.maxLength || 10) - 2)
    const maxLength = country.maxLength || 10
    return cleaned.length >= minLength && cleaned.length <= maxLength
  }

  const handlePhoneChange = (inputValue: string) => {
    const formatted = formatPhoneNumber(inputValue, selectedCountry)
    const isValid = isValidPhoneNumber(formatted, selectedCountry)
    setPhoneNumber(formatted)
    onChange(formatted, selectedCountry, isValid)
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    const formatted = formatPhoneNumber(phoneNumber, country)
    const isValid = isValidPhoneNumber(formatted, country)
    setPhoneNumber(formatted)
    onChange(formatted, country, isValid)
  }

  useEffect(() => {
    setPhoneNumber(value)
  }, [value])

  return (
    <div className="relative">
      <div className="flex">
        {/* Country Selector */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="h-12 px-3 rounded-r-none border-r-0 bg-gray-50 hover:bg-gray-100 focus:z-10"
          >
            <span className="mr-2">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 w-80 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg mt-1">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm border-b border-gray-100 last:border-b-0"
                >
                  <span>{country.flag}</span>
                  <span className="font-medium">{country.dialCode}</span>
                  <span className="text-gray-600 truncate">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Input */}
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={placeholder || "Digite o número"}
          className={`h-12 rounded-l-none focus:z-10 ${className}`}
        />
      </div>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
