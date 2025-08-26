"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback, lazy } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertTriangle, Eye, Lock, ChevronLeft, ChevronRight, Wifi, Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CountryPhoneInput } from "@/components/country-phone-input"
import { LoadingSpinner } from "@/components/loading-spinner"

// Lazy load components for better performance
const LazyImage = lazy(() => import("next/image"))

type Step = "welcome" | "headlines" | "form" | "scanning" | "chat-simulation" | "conversion" | "final"

interface WhatsAppProfileResponse {
  success: boolean
  result?: string
  is_photo_private?: boolean
  phone_number?: string
  error?: string
}

export default function SafeKidAIFunil() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [childName, setChildName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isProfilePrivate, setIsProfilePrivate] = useState(false)
  const [apiError, setApiError] = useState("")
  const [scanProgress, setScanProgress] = useState(0)
  const [currentProofIndex, setCurrentProofIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5 * 60) // 5 minutos em segundos
  const [ctaVariant, setCTAVariant] = useState(0) // Para teste A/B
  const [chatMessageIndex, setChatMessageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scanResults, setScanResults] = useState({
    telegram: { status: "safe", message: "No risks detected" },
    instagram: { status: "warning", message: "Tentativa de aliciamento detectada" },
    snapchat: { status: "danger", message: "Interação com perfil desconhecido" },
    tiktok: { status: "danger", message: "Conteúdo impróprio visualizado" },
    whatsapp: { status: "danger", message: "Conversa suspeita identificada" },
  })

  const nameInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const socialNetworks = [
    { name: "Instagram", icon: "/social-icons/instagram.png", color: "from-purple-500 to-pink-500" },
    { name: "TikTok", icon: "/social-icons/tiktok.png", color: "from-black to-gray-800" },
    { name: "WhatsApp", icon: "/social-icons/whatsapp.png", color: "from-green-500 to-green-600" },
    { name: "Telegram", icon: "/social-icons/telegram.png", color: "from-blue-500 to-blue-600" },
    { name: "Snapchat", icon: "/social-icons/snapchat.png", color: "from-yellow-400 to-yellow-500" },
  ]

  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)

  const newsCards = [
    {
      id: 1,
      image: "/news/cnn-tiktok.jpeg",
      title: "Teen Targeted on TikTok by predator posing as friend",
      source: "CNN",
      date: "March 22, 2024",
    },
    {
      id: 2,
      image: "/news/bbc-telegram-1.jpeg",
      title: "UK Girl Lured into private Telegram Group by online predator",
      source: "BBC News",
      date: "September 10, 2023",
    },
    {
      id: 3,
      image: "/news/guardian-snapchat.jpeg",
      title: "Teen tricked into sending private photos on Snapchat",
      source: "The Guardian",
      date: "November 2, 2023",
    },
    {
      id: 4,
      image: "/news/bbc-telegram-2.jpeg",
      title: "UK Girl Lured into Private Telegram by Online Predator",
      source: "BBC News",
      date: "September 10, 2023",
    },
  ]

  // Prova social dinâmica
  const socialProofs = [
    "Lucas's mom unlocked the report 2 minutes ago",
    "John (NY) activated protection just now",
    "Anna (CA) discovered suspicious activity 1 minute ago",
    "Carlos (TX) protected his daughter 3 minutes ago",
    "Maria (FL) unlocked complete analysis now",
  ]

  // Simulação de conversa suspeita
  const suspiciousChat = [
    { sender: "stranger", message: "You seem more mature than your age...", time: "19:03" },
    { sender: "child", message: "Really? Lol", time: "19:04" },
    { sender: "stranger", message: "Let's keep this between us, ok?", time: "19:05" },
    { sender: "stranger", message: "Do you have WhatsApp? We can talk better there", time: "19:06" },
    { sender: "child", message: "I don't know...", time: "19:07" },
    { sender: "stranger", message: "Trust me, I'm different from the others", time: "19:08" },
  ]

  // Depoimentos reais
  const realTestimonials = [
    {
      name: "Carlos M.",
      child: "Isadora's father",
      text: "I never thought my daughter could be talking to a stranger like that. SafeKid AI showed me things I never imagined.",
      avatar: "/testimonials/carlos-testimonial.jpg",
      verified: true,
    },
    {
      name: "Mariana R.",
      child: "Laura's mother",
      text: "I thought my daughter was safe. When I saw what they were sending her on Snapchat, I was shocked. Good thing I found out in time.",
      avatar: "/testimonials/mariana-testimonial.jpg",
      verified: true,
    },
  ]

  // Comentários estilo rede social
  const socialComments = [
    {
      name: "Rodrigo M.",
      time: "2 hours ago",
      comment:
        "I used it yesterday and was shocked. What I saw on my daughter's TikTok made me cry. Thank you for this tool.",
      avatar: "/testimonials/rodrigo-comment.jpg",
    },
    {
      name: "Patricia S.",
      time: "4 hours ago",
      comment: "My son was being manipulated on Discord and I didn't know. This analysis saved our family.",
      avatar: "/testimonials/patricia-comment.jpg",
    },
  ]

  // Variações de CTA para teste A/B
  const ctaVariants = [
    { text: "🔓 Unlock Complete Report", icon: Lock },
    { text: "🔒 Protect My Child Now", icon: Shield },
    { text: "🔍 View Urgent Report", icon: Eye },
    { text: "⚡ Unlock in Real Time", icon: AlertTriangle },
  ]

  const [profileLoaded, setProfileLoaded] = useState(false)

  // Preload critical images
  useEffect(() => {
    const preloadImages = [
      "/safekid-logo-shield.png",
      "/background/tech-kids.jpeg",
      "/testimonials/carlos-testimonial.jpg",
      "/testimonials/mariana-testimonial.jpg",
    ]

    preloadImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Session cache for form data
  useEffect(() => {
    const savedData = sessionStorage.getItem("safekid-form-data")
    if (savedData) {
      const { name, phone } = JSON.parse(savedData)
      if (name) setChildName(name)
      if (phone) setWhatsappNumber(phone)
    }
  }, [])

  // Save form data to session
  useEffect(() => {
    if (childName || whatsappNumber) {
      sessionStorage.setItem(
        "safekid-form-data",
        JSON.stringify({
          name: childName,
          phone: whatsappNumber,
        }),
      )
    }
  }, [childName, whatsappNumber])

  // Timer countdown
  useEffect(() => {
    if (currentStep === "conversion" || currentStep === "final") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep])

  // Rotação da prova social
  useEffect(() => {
    if (currentStep === "scanning") {
      const interval = setInterval(() => {
        setCurrentProofIndex((prev) => (prev + 1) % socialProofs.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [currentStep, socialProofs.length])

  // Animação da conversa suspeita
  useEffect(() => {
    if (currentStep === "chat-simulation") {
      const interval = setInterval(() => {
        setChatMessageIndex((prev) => {
          if (prev >= suspiciousChat.length - 1) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Função para buscar foto do WhatsApp
  const fetchWhatsAppProfile = useCallback(async (phone: string) => {
    if (!phone || phone.length < 8) return

    setIsLoadingProfile(true)
    setApiError("")
    setProfileLoaded(false)

    try {
      const response = await fetch("/api/whatsapp-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: WhatsAppProfileResponse = await response.json()

      if (data.success) {
        setProfileImage(data.result || "")
        setIsProfilePrivate(data.is_photo_private || false)
        setProfileLoaded(true)
      } else {
        setProfileImage("")
        setIsProfilePrivate(true)
        setApiError("Could not load profile photo")
        setProfileLoaded(true)
      }
    } catch (error) {
      console.error("Erro ao buscar foto:", error)
      setProfileImage("")
      setIsProfilePrivate(true)
      setApiError("Error connecting to server")
      setProfileLoaded(true)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  // Handle phone number change
  const handlePhoneChange = (value: string, country: any, isValid: boolean) => {
    setWhatsappNumber(value)
    setIsPhoneValid(isValid)

    const cleanPhone = value.replace(/\D/g, "")
    if (isValid && cleanPhone.length >= 8) {
      fetchWhatsAppProfile(cleanPhone)
    } else {
      setProfileImage("")
      setIsProfilePrivate(false)
      setApiError("")
      setProfileLoaded(false)
    }
  }

  // Função para verificar se pode avançar
  const canProceed = () => {
    const name = nameInputRef.current?.value.trim() || childName.trim()
    const hasValidName = name && name.length >= 2
    const hasValidPhone = isPhoneValid && whatsappNumber.trim().length > 0
    const isProfileReady = profileLoaded && !isLoadingProfile

    return hasValidName && hasValidPhone && isProfileReady
  }

  // Função para iniciar análise
  const handleStartAnalysis = async () => {
    if (!canProceed()) return

    setIsTransitioning(true)

    const name = nameInputRef.current?.value.trim() || childName.trim()
    setChildName(name)

    // Simulate brief loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    setCurrentStep("scanning")
    setCTAVariant(Math.floor(Math.random() * ctaVariants.length))
    setIsTransitioning(false)
  }

  // Manipulador de tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      e.preventDefault()
      handleStartAnalysis()
    }
  }

  // Handle step transitions with loading states
  const handleStepTransition = async (nextStep: Step) => {
    setIsTransitioning(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    setCurrentStep(nextStep)
    setIsTransitioning(false)
  }

  // Animação de escaneamento
  useEffect(() => {
    if (currentStep === "scanning") {
      setScanProgress(0)
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => handleStepTransition("chat-simulation"), 1000)
            return 100
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Auto-scroll do carrossel de notícias
  useEffect(() => {
    if (currentStep === "headlines") {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % newsCards.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [currentStep, newsCards.length])

  const nextNews = () => {
    setCurrentNewsIndex((prev) => (prev + 1) % newsCards.length)
  }

  const prevNews = () => {
    setCurrentNewsIndex((prev) => (prev - 1 + newsCards.length) % newsCards.length)
  }

  // Formatação do timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Estatística local
  const getLocalStatistic = () => {
    return "This month alone, 57 cases were registered in our area."
  }

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6">
        <LoadingSpinner message="Loading verification..." />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen font-sans">
      {/* Loading Overlay */}
      {isTransitioning && <LoadingOverlay />}

      <AnimatePresence mode="wait">
        {/* Tela de Boas-Vindas */}
        {currentStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(1px)",
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A30]/80 via-[#0B1A30]/60 to-[#0B1A30]/80" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
              {/* Logo */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center mb-4">
                  <img
                    src="/safekid-logo-shield.png"
                    alt="SafeKid AI"
                    className="w-24 h-24 object-contain"
                    loading="eager"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">SafeKid AI</h1>
                <p className="text-[#1FE3C2] text-sm md:text-base font-medium">
                  Real-time digital protection for conscious parents
                </p>
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Do you know who your child is talking to
                  <span className="text-[#FF4B4B]"> right now?</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                  More than <span className="text-[#FFCE00] font-bold">73% of parents</span> don't monitor their
                  children's social media
                </p>
              </motion.div>

              {/* Social Networks */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4 mb-8"
              >
                {socialNetworks.map((network, index) => (
                  <motion.div
                    key={network.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className={`bg-gradient-to-r ${network.color} p-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[120px] justify-center`}
                  >
                    <img
                      src={network.icon || "/placeholder.svg"}
                      alt={network.name}
                      className="w-6 h-6 object-contain"
                      loading="lazy"
                    />
                    <span className="text-white font-semibold text-sm">{network.name}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center"
              >
                <Button
                  onClick={() => handleStepTransition("headlines")}
                  className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md"
                >
                  <Shield className="w-6 h-6 mr-2" />
                  Start Free Verification
                </Button>
                <p className="text-gray-400 text-sm mt-4">
                  🔒 100% Confidential • Real-time analysis • Used by +50,000 families
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Formulário de Coleta */}
        {currentStep === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 w-full max-w-md mx-auto px-4">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] rounded-xl mb-4">
                      <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Digital Security Analysis</h2>
                    <p className="text-white">Insira os dados para iniciar a verificação forense</p>
                  </div>

                  <form ref={formRef} className="space-y-6" onKeyDown={handleKeyDown}>
                    {/* Nome do filho */}
                    <div>
                      <label className="block font-semibold mb-2 text-white">Your child's full name</label>
                      <Input
                        ref={nameInputRef}
                        type="text"
                        placeholder="Enter full name"
                        className="input-enhanced h-12 text-base"
                        defaultValue={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Número do filho */}
                    <div>
                      <label className="block font-semibold mb-2 text-whiteúmero do filho(a)">
                        Child's phone number
                      </label>
                      <CountryPhoneInput
                        value={whatsappNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        className="text-base"
                      />

                      {/* Exibição da foto de perfil */}
                      {whatsappNumber.replace(/\D/g, "").length >= 8 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                            {isLoadingProfile ? "Searching profile photo..." : "Profile photo detected:"}
                          </p>

                          <div className="flex justify-center">
                            {isLoadingProfile ? (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <LoadingSpinner size="sm" message="" />
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={
                                    profileImage ||
                                    `https://ui-avatars.com/api/?name=User&background=885EFF&color=fff&size=200` ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt="Foto de perfil"
                                  className="w-20 h-20 rounded-full border-4 border-[#885EFF] shadow-lg object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=User&background=885EFF&color=fff&size=200`
                                  }}
                                />
                                {(isProfilePrivate || !profileImage) && (
                                  <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                                    <Lock className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {apiError ? (
                            <p className="text-red-500 text-xs text-center mt-2">{apiError}</p>
                          ) : isProfilePrivate && !isLoadingProfile ? (
                            <p className="text-yellow-600 text-xs text-center mt-2">
                              {profileImage ? "Profile found" : "Using default avatar"}
                            </p>
                          ) : !isLoadingProfile && profileImage ? (
                            <p className="text-green-600 text-xs text-center mt-2 font-medium">
                              ✅ Profile found successfully!
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={!canProceed() || isTransitioning}
                      className="w-full bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 text-lg rounded-xl btn-enhanced disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoadingProfile || isTransitioning ? (
                        <>
                          <LoadingSpinner size="sm" message="" />
                          <span className="ml-2">
                            {isTransitioning ? "Starting analysis..." : "Verifying profile..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Start Forensic Analysis
                        </>
                      )}
                    </Button>

                    {canProceed() && !isLoadingProfile && !isTransitioning && (
                      <p className="text-green-600 text-sm text-center font-medium">
                        ✅ Press Enter or click button to continue
                      </p>
                    )}
                  </form>

                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Lock className="w-4 h-4 text-slate-50 text-slate-50" />
                        <span
                          className="text-slate-50"
                          className="text-slate-50"
                          className="text-white"
                          className="text-transparent"
                          className="text-white"
                        >
                          SSL Encryption
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-slate-50 text-slate-50 text-slate-100" />
                        <span
                          className="text-slate-50"
                          className="text-slate-50"
                          className="text-white"
                          className="text-slate-600"
                        >
                          Data Protection
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Escaneamento Forense */}
        {currentStep === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center"
          >
            {/* Matrix Background Effect */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-[#1FE3C2] text-sm font-mono opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                >
                  {Math.random().toString(36).substring(7)}
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto px-4">
              <Card className="bg-gray-900 border-2 border-[#1FE3C2] rounded-2xl shadow-2xl">
                <CardContent className="p-8 text-center">
                  {/* Profile Image */}
                  <div className="mb-8">
                    <img
                      src={
                        profileImage ||
                        `https://ui-avatars.com/api/?name=${childName || "User"}&background=885EFF&color=fff&size=200`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl mx-auto border-4 border-[#1FE3C2] shadow-lg"
                    />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">FORENSIC ANALYSIS IN PROGRESS</h2>
                  <p className="text-[#1FE3C2] mb-8 text-lg">
                    Scanning profile of <strong>{childName}</strong>...
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <Progress value={scanProgress} className="h-4 bg-gray-800 rounded-full overflow-hidden" />
                  </div>

                  <p className="text-white text-xl font-bold mb-8">{Math.round(scanProgress)}% completed</p>

                  {/* Prova Social Dinâmica */}
                  <motion.div
                    key={currentProofIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-6"
                  >
                    <p className="text-green-400 text-sm font-medium">{socialProofs[currentProofIndex]}</p>
                  </motion.div>

                  {/* Social Networks Status */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    {socialNetworks.map((network, index) => {
                      const isScanned = scanProgress > (index + 1) * 20
                      const networkKey = network.name.toLowerCase() as keyof typeof scanResults
                      const result = scanResults[networkKey]

                      return (
                        <div
                          key={network.name}
                          className={`p-4 rounded-lg border transition-all duration-500 ${
                            isScanned
                              ? result.status === "safe"
                                ? "border-green-500 bg-green-500/10"
                                : result.status === "warning"
                                  ? "border-yellow-500 bg-yellow-500/10"
                                  : "border-red-500 bg-red-500/10"
                              : "border-gray-600 bg-gray-800/50"
                          }`}
                        >
                          <img
                            src={network.icon || "/placeholder.svg"}
                            alt={network.name}
                            className="w-8 h-8 mx-auto mb-2 object-contain"
                            loading="lazy"
                          />
                          <div className="text-white font-semibold text-sm mb-1">{network.name}</div>
                          {isScanned && (
                            <div
                              className={`text-xs ${
                                result.status === "safe"
                                  ? "text-green-400"
                                  : result.status === "warning"
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {result.status === "safe" ? "✅" : result.status === "warning" ? "⚠️" : "❌"}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-3 text-[#1FE3C2] text-sm">
                    <Shield className="w-5 h-5" />
                    <span>Secure and encrypted connection</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Nova Seção: Simulação de Conversa Suspeita */}
        {currentStep === "chat-simulation" && (
          <motion.div
            key="chat-simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
              {/* Header */}
              <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Suspicious Conversation Detected</h2>
                <p className="text-lg text-red-400 mb-6">
                  Example of the type of conversation found in the profile of <strong>{childName}</strong>
                </p>
              </motion.div>

              {/* Chat Simulation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-md mx-auto mb-8"
              >
                <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">?</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Unknown User</h4>
                      <p className="text-gray-400 text-xs">Online now</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {suspiciousChat.slice(0, chatMessageIndex + 1).map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.5 }}
                        className={`flex ${message.sender === "child" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            message.sender === "child"
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-red-500/20 border border-red-500/30 text-red-300 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">{message.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {chatMessageIndex >= suspiciousChat.length - 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
                  <Button
                    onClick={() => handleStepTransition("conversion")}
                    className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-3 px-6 rounded-xl"
                  >
                    Continue Analysis →
                  </Button>
                </motion.div>
              )}

              {/* Warning Message */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6 max-w-2xl mx-auto text-center"
              >
                <h3 className="text-xl font-bold text-red-400 mb-2">⚠️ GROOMING PATTERN IDENTIFIED</h3>
                <p className="text-white mb-4">
                  This is just a sample. The complete report contains detailed analysis of all suspicious conversations.
                </p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Isolation attempt ("between us")</p>
                  <p>• Inappropriate compliments for age</p>
                  <p>• Private contact request</p>
                  <p>• False trust building</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Nova Seção: Headlines */}
        {currentStep === "headlines" && (
          <motion.div
            key="headlines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
              {/* Header */}
              <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Real Cases That Made Headlines
                </h2>
                <p className="text-lg md:text-xl text-[#1FE3C2] mb-6">And show why SafeKid AI is needed now.</p>
              </motion.div>

              {/* Carrossel */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative mb-8"
              >
                <div className="overflow-hidden rounded-2xl max-w-2xl mx-auto">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentNewsIndex * 100}%)` }}
                  >
                    {newsCards.map((news) => (
                      <div key={news.id} className="w-full flex-shrink-0">
                        <Card className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
                          <CardContent className="p-0">
                            <img
                              src={news.image || "/placeholder.svg"}
                              alt={news.title}
                              className="w-full h-auto object-cover"
                              loading="lazy"
                            />
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controles do carrossel */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevNews}
                    className="border-[#1FE3C2] text-white hover:bg-[#1FE3C2]/20 bg-transparent p-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex gap-2">
                    {newsCards.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentNewsIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentNewsIndex ? "bg-[#1FE3C2]" : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextNews}
                    className="border-[#1FE3C2] text-white hover:bg-[#1FE3C2]/20 bg-transparent p-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Informações da notícia atual */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">REAL CASE</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{newsCards[currentNewsIndex].title}</h3>
                <p className="text-[#FFCE00] font-semibold">
                  {newsCards[currentNewsIndex].source} • {newsCards[currentNewsIndex].date}
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button
                  onClick={() => handleStepTransition("form")}
                  className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md"
                >
                  <Shield className="w-6 h-6 mr-2" />I Want to Protect Now
                </Button>
                <p className="text-gray-400 text-sm mt-4">Don't let your child become the next headline</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Tela de Conversão */}
        {currentStep === "conversion" && (
          <motion.div
            key="conversion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

            <div className="relative z-10 min-h-screen flex flex-col">
              {/* Container principal com padding adequado */}
              <div className="flex-1 container mx-auto px-4 py-6 md:py-12 flex flex-col justify-center max-w-4xl">
                {/* Timer de Urgência */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-4"
                >
                  <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">LIMITED ACCESS</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatTime(timeLeft)}</div>
                    <p className="text-red-300 text-sm">Time remaining to access the report</p>
                  </div>
                </motion.div>

                {/* Header Principal */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    🚨 COMPLETE ANALYSIS OF <span className="text-red-400">{childName.toUpperCase()}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-[#FFCE00] font-semibold mb-4">
                    4 risk situations detected that require immediate attention
                  </p>
                  <div className="text-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      CONFIDENTIAL REPORT
                    </span>
                  </div>
                </motion.div>

                {/* Resumo dos Riscos */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                  {[
                    {
                      platform: "Instagram",
                      risk: "HIGH",
                      issue: "Grooming attempt detected",
                      color: "border-red-500 bg-red-500/10",
                      icon: "❌",
                    },
                    {
                      platform: "Snapchat",
                      risk: "CRITICAL",
                      issue: "Interaction with unknown profile",
                      color: "border-red-600 bg-red-600/20",
                      icon: "🚨",
                    },
                    {
                      platform: "TikTok",
                      risk: "HIGH",
                      issue: "Inappropriate content viewed",
                      color: "border-red-500 bg-red-500/10",
                      icon: "⚠️",
                    },
                    {
                      platform: "WhatsApp",
                      risk: "CRITICAL",
                      issue: "Suspicious conversation identified",
                      color: "border-red-600 bg-red-600/20",
                      icon: "🚨",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${item.color}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{item.platform}</h3>
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          RISK {item.risk}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{item.issue}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Estatística Local */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-center"
                >
                  <p className="text-yellow-400 font-semibold">{getLocalStatistic()}</p>
                </motion.div>

                {/* CTA Principal */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mb-6"
                >
                  <Button
                    onClick={() => handleStepTransition("final")}
                    className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-6 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md mb-4"
                  >
                    {React.createElement(ctaVariants[ctaVariant].icon, { className: "w-6 h-6 mr-2" })}
                    {ctaVariants[ctaVariant].text}
                  </Button>
                  <p className="text-gray-400 text-sm">
                    \ 💳 Pagamento seguro • 🔒 Dados protegidos • ⚡ Acesso imediato
                  </p>
                </motion.div>

                {/* Depoimentos */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                  {realTestimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                          loading="lazy"
                        />
                        <div>
                          <h4 className="text-white font-semibold">{testimonial.name}</h4>
                          <p className="text-gray-400 text-sm">{testimonial.child}</p>
                        </div>
                        {testimonial.verified && <span className="text-[#1FE3C2] text-sm">✅</span>}
                      </div>
                      <p className="text-gray-300 text-sm italic">"{testimonial.text}"</p>
                    </div>
                  ))}
                </motion.div>

                {/* Comentários Sociais */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="space-y-3"
                >
                  {socialComments.map((comment, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={comment.avatar || "/placeholder.svg"}
                          alt={comment.name}
                          className="w-8 h-8 rounded-full object-cover"
                          loading="lazy"
                        />
                        <div>
                          <span className="text-white font-semibold text-sm">{comment.name}</span>
                          <span className="text-gray-400 text-xs ml-2">{comment.time}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.comment}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tela Final */}
        {currentStep === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
              {/* Timer de Urgência */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-bold">OFFER EXPIRES IN</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{formatTime(timeLeft)}</div>
                  <p className="text-red-300 text-sm">Don't miss this unique opportunity</p>
                </div>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  UNLOCK THE COMPLETE REPORT
                </h1>
                <p className="text-lg md:text-xl text-[#FFCE00] font-semibold mb-6">
                  Complete access to digital profile of <strong>{childName}</strong>
                </p>
              </motion.div>

              {/* Oferta Principal */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <Card className="bg-gradient-to-br from-[#885EFF]/20 to-[#1FE3C2]/20 border-2 border-[#1FE3C2] rounded-2xl shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <div className="text-6xl font-bold text-white mb-2">
                        <span className="line-through text-3xl text-red-500">R$ 177</span>
                      </div>
                      <div className="text-6xl font-bold text-[#1FE3C2] mb-2">$27</div>
                      <p className="text-white text-lg">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-2">
                          76% OFF
                        </span>
                        Today only!
                      </p>
                    </div>

                    <div className="space-y-3 mb-8 text-left">
                      {[
                        "Complete report of all social networks",
                        "Real-time suspicious conversation analysis",
                        "Dangerous profile identification",
                        "Inappropriate content alerts",
                        "Continuous monitoring for 30 days",
                        "24/7 specialized support",
                        "7-day guarantee or your money back",
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="text-white"
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={() =>
                        window.open("https://pay.mundpay.com/0198e65d-0cb7-71b7-b562-82ef75499b4c?ref=", "_blank")
                      }
                      className="w-full bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 text-xl rounded-xl shadow-2xl btn-enhanced mb-4"
                    >
                      <Lock className="w-6 h-6 mr-2" />
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-6 h-6 mr-2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>UNLOCK NOW - $27
                    </Button>

                    <p className="text-gray-400 text-sm">🔒 100% secure payment • Card or PayPal • Immediate access</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Garantia */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mb-8"
              >
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 max-w-md mx-auto">
                  <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-400 mb-2">7-Day Guarantee</h3>
                  <p className="text-white text-sm">
                    If you're not 100% satisfied, we'll refund your money with no questions asked.
                  </p>
                </div>
              </motion.div>

              {/* Urgência Final */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="text-red-400 font-bold text-lg mb-4">
                  ⚠️ Only {Math.floor(Math.random() * 15) + 5} spots remaining today!
                </p>
                <p className="text-gray-400 text-sm">Don't leave your child's safety for later. Act now!</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
