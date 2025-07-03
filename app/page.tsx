"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertTriangle, Eye, Lock, ChevronLeft, ChevronRight, Wifi, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Step = "welcome" | "headlines" | "form" | "scanning" | "realcases" | "conversion" | "news" | "final"

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
  const [profileImage, setProfileImage] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isProfilePrivate, setIsProfilePrivate] = useState(false)
  const [apiError, setApiError] = useState("")
  const [scanProgress, setScanProgress] = useState(0)
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  const [currentRealCaseIndex, setCurrentRealCaseIndex] = useState(0)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [scanResults, setScanResults] = useState({
    telegram: { status: "safe", message: "Sem riscos detectados" },
    instagram: { status: "warning", message: "Tentativa de aliciamento detectada" },
    snapchat: { status: "danger", message: "Interação com perfil desconhecido" },
    tiktok: { status: "danger", message: "Conteúdo impróprio visualizado" },
    whatsapp: { status: "danger", message: "Conversa suspeita identificada" },
  })

  const nameInputRef = useRef<HTMLInputElement>(null)
  const whatsappInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [currentHeadlineImageIndex, setCurrentHeadlineImageIndex] = useState(0)
  const [currentHeadlineTextIndex, setCurrentHeadlineTextIndex] = useState(0)

  const socialNetworks = [
    { name: "Instagram", icon: "/social-icons/instagram.png", color: "from-purple-500 to-pink-500" },
    { name: "TikTok", icon: "/social-icons/tiktok.png", color: "from-black to-gray-800" },
    { name: "WhatsApp", icon: "/social-icons/whatsapp.png", color: "from-green-500 to-green-600" },
    { name: "Telegram", icon: "/social-icons/telegram.png", color: "from-blue-500 to-blue-600" },
    { name: "Snapchat", icon: "/social-icons/snapchat.png", color: "from-yellow-400 to-yellow-500" },
  ]

  // Casos reais para o carrossel
  const realCases = [
    {
      id: 1,
      outlet: "The Guardian",
      logo: "🏛️", // Placeholder - pode ser substituído por logo real
      headline: "Children are speaking to strangers online – and grooming is on the rise",
      subheadline: "UK experts warn: social media is fueling a silent epidemic.",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
    },
    {
      id: 2,
      outlet: "BBC News",
      logo: "📺", // Placeholder - pode ser substituído por logo real
      headline: "UK Girl lured into private Telegram group by online predator",
      subheadline: "Police investigating suspected grooming case in Manchester.",
      bgColor: "bg-red-50",
      textColor: "text-red-900",
    },
    {
      id: 3,
      outlet: "CNN",
      logo: "📰", // Placeholder - pode ser substituído por logo real
      headline: "Teen Targeted on TikTok by predator posing as friend",
      subheadline: "Case reported in the U.S. involving a 13-year-old girl.",
      bgColor: "bg-orange-50",
      textColor: "text-orange-900",
    },
    {
      id: 4,
      outlet: "NSPCC",
      logo: "🛡️", // Placeholder - pode ser substituído por logo real
      headline: "82% rise in online grooming crimes against children in the last 5 years",
      subheadline: "Instagram and Snapchat lead in reports of abuse.",
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
    },
    {
      id: 5,
      outlet: "ICE / Homeland Security",
      logo: "🏛️", // Placeholder - pode ser substituído por logo real
      headline: "Global online child abuse operation rescues over 450 minors",
      subheadline: "Authorities say dark web is being used to target young children.",
      bgColor: "bg-gray-50",
      textColor: "text-gray-900",
    },
  ]

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

  // Headlines para a nova seção
  const headlineImages = [
    {
      id: 1,
      image: "/news/cnn-tiktok.jpeg",
      title: "Teen Targeted on TikTok by predator posing as friend",
      source: "CNN",
    },
    {
      id: 2,
      image: "/news/bbc-telegram-1.jpeg",
      title: "UK Girl Lured into private Telegram Group by online predator",
      source: "BBC News",
    },
    {
      id: 3,
      image: "/news/guardian-snapchat.jpeg",
      title: "Teen tricked into sending private photos on Snapchat",
      source: "The Guardian",
    },
    {
      id: 4,
      image: "/news/bbc-telegram-2.jpeg",
      title: "UK Girl Lured into Private Telegram by Online Predator",
      source: "BBC News",
    },
  ]

  const headlineTexts = [
    {
      id: 1,
      headline: "Children are speaking to strangers online – and grooming is on the rise",
      source: "The Guardian",
      date: "November 15, 2023",
      icon: "🏛️",
    },
    {
      id: 2,
      headline: "82% rise in online grooming crimes against children in the last 5 years",
      source: "NSPCC",
      date: "October 8, 2023",
      icon: "🛡️",
    },
    {
      id: 3,
      headline: "Global online child abuse operation rescues over 450 minors",
      source: "ICE / Homeland Security",
      date: "September 22, 2023",
      icon: "🏛️",
    },
    {
      id: 4,
      headline: "Social media platforms failing to protect children from predators",
      source: "BBC News",
      date: "August 30, 2023",
      icon: "📺",
    },
  ]

  // Função para buscar foto do WhatsApp
  const fetchWhatsAppProfile = useCallback(async (phone: string) => {
    if (!phone || phone.length < 10) return

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
        setApiError("Não foi possível carregar a foto do perfil")
        setProfileLoaded(true)
      }
    } catch (error) {
      console.error("Erro ao buscar foto:", error)
      setProfileImage("")
      setIsProfilePrivate(true)
      setApiError("Erro ao conectar com o servidor")
      setProfileLoaded(true)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  // Formatação do número de WhatsApp
  const formatWhatsAppNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      let formatted = numbers
      if (numbers.length >= 11) {
        formatted = numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
      } else if (numbers.length >= 10) {
        formatted = numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
      } else if (numbers.length >= 6) {
        formatted = numbers.replace(/(\d{2})(\d{4})(\d*)/, "($1) $2-$3")
      } else if (numbers.length >= 2) {
        formatted = numbers.replace(/(\d{2})(\d*)/, "($1) $2")
      }
      return formatted
    }
    return value
  }

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatWhatsAppNumber(value)
    setWhatsappNumber(formatted)

    const cleanPhone = value.replace(/\D/g, "")
    if (cleanPhone.length >= 10) {
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
    const name = nameInputRef.current?.value.trim() || ""
    const whatsapp = whatsappInputRef.current?.value.trim() || ""
    return name && whatsapp && profileLoaded && !isLoadingProfile
  }

  // Função para iniciar análise
  const handleStartAnalysis = () => {
    if (canProceed()) {
      const name = nameInputRef.current?.value.trim() || ""
      setChildName(name)
      setCurrentStep("scanning")
    }
  }

  // Manipulador de tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      e.preventDefault()
      handleStartAnalysis()
    }
  }

  // Animação de escaneamento - ATUALIZADA para ir para realcases
  useEffect(() => {
    if (currentStep === "scanning") {
      setScanProgress(0)
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            // Após scanning, vai para casos reais
            setTimeout(() => setCurrentStep("realcases"), 1000)
            return 100
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Auto-scroll do carrossel de casos reais
  useEffect(() => {
    if (currentStep === "realcases") {
      const interval = setInterval(() => {
        setCurrentRealCaseIndex((prev) => (prev + 1) % realCases.length)
      }, 5000) // 5 segundos por caso
      return () => clearInterval(interval)
    }
  }, [currentStep, realCases.length])

  // Auto-scroll do carrossel de notícias
  useEffect(() => {
    if (currentStep === "news") {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % newsCards.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [currentStep, newsCards.length])

  // Auto-scroll do carrossel de imagens de headlines
  useEffect(() => {
    if (currentStep === "headlines") {
      const interval = setInterval(() => {
        setCurrentHeadlineImageIndex((prev) => (prev + 1) % headlineImages.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [currentStep, headlineImages.length])

  // Auto-scroll do carrossel de texto de headlines
  useEffect(() => {
    if (currentStep === "headlines") {
      const interval = setInterval(() => {
        setCurrentHeadlineTextIndex((prev) => (prev + 1) % headlineTexts.length)
      }, 3500)
      return () => clearInterval(interval)
    }
  }, [currentStep, headlineTexts.length])

  const nextRealCase = () => {
    setCurrentRealCaseIndex((prev) => (prev + 1) % realCases.length)
  }

  const prevRealCase = () => {
    setCurrentRealCaseIndex((prev) => (prev - 1 + realCases.length) % realCases.length)
  }

  const nextNews = () => {
    setCurrentNewsIndex((prev) => (prev + 1) % newsCards.length)
  }

  const prevNews = () => {
    setCurrentNewsIndex((prev) => (prev - 1 + newsCards.length) % newsCards.length)
  }

  const nextHeadlineImage = () => {
    setCurrentHeadlineImageIndex((prev) => (prev + 1) % headlineImages.length)
  }

  const prevHeadlineImage = () => {
    setCurrentHeadlineImageIndex((prev) => (prev - 1 + headlineImages.length) % headlineImages.length)
  }

  const nextHeadlineText = () => {
    setCurrentHeadlineTextIndex((prev) => (prev + 1) % headlineTexts.length)
  }

  const prevHeadlineText = () => {
    setCurrentHeadlineTextIndex((prev) => (prev - 1 + headlineTexts.length) % headlineTexts.length)
  }

  return (
    <div className="min-h-screen font-sans">
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
                  <img src="/safekid-logo.png" alt="SafeKid AI" className="w-24 h-24 object-contain" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">SafeKid AI</h1>
                <p className="text-[#1FE3C2] text-sm md:text-base font-medium">
                  Proteção digital em tempo real para pais conscientes
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
                  Você sabe com quem seu filho está falando
                  <span className="text-[#FF4B4B]"> agora?</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                  Mais de <span className="text-[#FFCE00] font-bold">73% dos pais</span> não monitoram as redes sociais
                  dos filhos
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
                  onClick={() => setCurrentStep("headlines")}
                  className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md"
                >
                  <Shield className="w-6 h-6 mr-2" />
                  Iniciar Verificação Gratuita
                </Button>
                <p className="text-gray-400 text-sm mt-4">
                  🔒 100% Confidencial • ⚡ Análise em tempo real • ✅ Usado por +50.000 famílias
                </p>
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

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

            <div className="relative z-10 min-h-screen flex flex-col justify-center py-8 md:py-16">
              <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-8 md:mb-12"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Casos Reais que Chocaram o Mundo
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6">
                    Manchetes de veículos renomados mostram a realidade que muitos pais preferem ignorar
                  </p>
                </motion.div>

                {/* Carrossel Visual de Imagens */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative mb-8 md:mb-12"
                >
                  <div className="overflow-hidden rounded-2xl max-w-3xl mx-auto">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentHeadlineImageIndex * 100}%)` }}
                    >
                      {headlineImages.map((headline) => (
                        <div key={headline.id} className="w-full flex-shrink-0 relative">
                          <div className="relative">
                            <img
                              src={headline.image || "/placeholder.svg"}
                              alt={headline.title}
                              className="w-full h-auto object-cover rounded-2xl"
                            />
                            {/* Selo REAL CASE */}
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                              ⚠️ REAL CASE
                            </div>
                            {/* Overlay com informações */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                              <p className="text-white font-bold text-lg mb-1">{headline.source}</p>
                              <p className="text-gray-300 text-sm">{headline.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controles do carrossel de imagens */}
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevHeadlineImage}
                      className="border-[#1FE3C2] text-white hover:bg-[#1FE3C2]/20 bg-transparent p-2 rounded-full"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-2">
                      {headlineImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHeadlineImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentHeadlineImageIndex ? "bg-[#1FE3C2]" : "bg-gray-500"
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextHeadlineImage}
                      className="border-[#1FE3C2] text-white hover:bg-[#1FE3C2]/20 bg-transparent p-2 rounded-full"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Carrossel Textual */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative mb-8 md:mb-12"
                >
                  <Card className="bg-gray-900/90 border border-gray-700 rounded-2xl shadow-2xl max-w-4xl mx-auto">
                    <CardContent className="p-6 md:p-8">
                      <div className="overflow-hidden">
                        <div
                          className="flex transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${currentHeadlineTextIndex * 100}%)` }}
                        >
                          {headlineTexts.map((text) => (
                            <div key={text.id} className="w-full flex-shrink-0">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                  <span className="text-2xl">{text.icon}</span>
                                  <span className="text-[#1FE3C2] font-bold text-lg">{text.source}</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight cursor-pointer hover:text-[#1FE3C2] transition-colors">
                                  "{text.headline}"
                                </h3>
                                <p className="text-gray-400 text-sm">{text.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Controles do carrossel textual */}
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevHeadlineText}
                      className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent p-2 rounded-full"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-2">
                      {headlineTexts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHeadlineTextIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentHeadlineTextIndex ? "bg-[#1FE3C2]" : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextHeadlineText}
                      className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent p-2 rounded-full"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Frase de Alerta */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-8 md:mb-12"
                >
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-bold text-red-400 mb-4 flex items-center justify-center gap-3">
                      ⚠️ Não deixe seu filho virar a próxima estatística.
                    </h3>
                    <p className="text-gray-300 text-lg">
                      A cada dia que passa, mais crianças se tornam vítimas de predadores online.
                      <br />
                      <span className="text-[#FFCE00] font-bold">Aja agora, antes que seja tarde demais.</span>
                    </p>
                  </div>
                </motion.div>

                {/* CTA Principal */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <Button
                    onClick={() => setCurrentStep("form")}
                    className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md mb-4"
                  >
                    <Shield className="w-6 h-6 mr-2" />
                    Verificar Meu Filho Agora
                  </Button>
                  <p className="text-gray-400 text-sm">🔒 Análise 100% confidencial • ⚡ Resultados em tempo real</p>
                </motion.div>
              </div>
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Análise de Segurança Digital</h2>
                    <p className="text-gray-600">Insira os dados para iniciar a verificação forense</p>
                  </div>

                  <form ref={formRef} className="space-y-6" onKeyDown={handleKeyDown}>
                    {/* Nome do filho */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Nome completo do seu filho(a)</label>
                      <Input
                        ref={nameInputRef}
                        type="text"
                        placeholder="Digite o nome completo"
                        className="input-enhanced h-12 text-base"
                        defaultValue={childName}
                        required
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Número de WhatsApp</label>
                      <Input
                        ref={whatsappInputRef}
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={whatsappNumber}
                        onChange={(e) => handleWhatsAppChange(e.target.value)}
                        className="input-enhanced h-12 text-base"
                        maxLength={15}
                        required
                      />

                      {/* Exibição da foto de perfil */}
                      {whatsappNumber.replace(/\D/g, "").length >= 10 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                            {isLoadingProfile ? "Buscando foto de perfil..." : "Foto de perfil detectada:"}
                          </p>

                          <div className="flex justify-center">
                            {isLoadingProfile ? (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <div className="spinner-tech w-8 h-8"></div>
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={
                                    profileImage ||
                                    `https://ui-avatars.com/api/?name=User&background=885EFF&color=fff&size=200` ||
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
                              {profileImage ? "Perfil encontrado" : "Usando avatar padrão"}
                            </p>
                          ) : !isLoadingProfile && profileImage ? (
                            <p className="text-green-600 text-xs text-center mt-2 font-medium">
                              ✅ Perfil encontrado com sucesso!
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={!canProceed()}
                      className="w-full bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 text-lg rounded-xl btn-enhanced disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingProfile ? (
                        <>
                          <div className="spinner-tech w-5 h-5 mr-2"></div>
                          Verificando perfil...
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Iniciar Análise Forense
                        </>
                      )}
                    </Button>

                    {profileLoaded && (
                      <p className="text-green-600 text-sm text-center font-medium">
                        ✅ Pressione Enter ou clique no botão para continuar
                      </p>
                    )}
                  </form>

                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span>Criptografia SSL</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>Proteção LGPD</span>
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
                        `https://ui-avatars.com/api/?name=${childName || "/placeholder.svg"}&background=885EFF&color=fff&size=200`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl mx-auto border-4 border-[#1FE3C2] shadow-lg"
                    />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">ANÁLISE FORENSE EM ANDAMENTO</h2>
                  <p className="text-[#1FE3C2] mb-8 text-lg">
                    Escaneando perfil de <strong>{childName}</strong>...
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <Progress value={scanProgress} className="h-4 bg-gray-800 rounded-full overflow-hidden" />
                  </div>

                  <p className="text-white text-xl font-bold mb-8">{Math.round(scanProgress)}% concluído</p>

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
                    <span>Conexão segura e criptografada</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* NOVA SEÇÃO: Casos Reais */}
        {currentStep === "realcases" && (
          <motion.div
            key="realcases"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
            }}
          >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col justify-center py-8 md:py-16">
              <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-8 md:mb-12"
                >
                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    CASOS REAIS
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Manchetes que Chocaram o Mundo
                  </h2>
                  <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                    Casos reais reportados por veículos de imprensa renomados mostram a urgência de proteger nossas
                    crianças online.
                  </p>
                </motion.div>

                {/* Carrossel de Casos Reais */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative mb-8 md:mb-12"
                >
                  {/* Container do carrossel */}
                  <div className="overflow-hidden rounded-2xl">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentRealCaseIndex * 100}%)` }}
                    >
                      {realCases.map((realCase, index) => (
                        <motion.div
                          key={realCase.id}
                          className="w-full flex-shrink-0"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{
                            opacity: index === currentRealCaseIndex ? 1 : 0.7,
                            scale: index === currentRealCaseIndex ? 1 : 0.95,
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card
                            className={`${realCase.bgColor} border-0 shadow-2xl rounded-2xl overflow-hidden mx-2 md:mx-4`}
                          >
                            <CardContent className="p-6 md:p-8 lg:p-12">
                              {/* Selo REAL CASE */}
                              <div className="flex justify-between items-start mb-6">
                                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                  ⚠️ REAL CASE
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{realCase.logo}</span>
                                  <span className={`font-bold text-sm ${realCase.textColor}`}>{realCase.outlet}</span>
                                </div>
                              </div>

                              {/* Headline */}
                              <h3
                                className={`text-2xl md:text-3xl lg:text-4xl font-bold ${realCase.textColor} mb-4 leading-tight`}
                              >
                                "{realCase.headline}"
                              </h3>

                              {/* Subheadline */}
                              <p className={`text-base md:text-lg ${realCase.textColor.replace("900", "700")} mb-6`}>
                                {realCase.subheadline}
                              </p>

                              {/* Source indicator */}
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <ExternalLink className="w-4 h-4" />
                                <span>Fonte verificada: {realCase.outlet}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Controles do carrossel */}
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevRealCase}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-2">
                      {realCases.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentRealCaseIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentRealCaseIndex ? "bg-red-500" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextRealCase}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Estatística de impacto */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 md:p-8 mb-8 text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">82%</div>
                  <p className="text-lg md:text-xl text-red-800 font-semibold mb-2">
                    Aumento em crimes de aliciamento online nos últimos 5 anos
                  </p>
                  <p className="text-red-700">
                    Segundo dados oficiais do NSPCC (National Society for the Prevention of Cruelty to Children)
                  </p>
                </motion.div>

                {/* CTA Principal */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <Button
                    onClick={() => setCurrentStep("conversion")}
                    className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md mb-4"
                  >
                    <Lock className="w-6 h-6 mr-2" />🔒 Quero proteger meu filho agora
                  </Button>
                  <p className="text-gray-600 text-sm">Não deixe seu filho se tornar a próxima estatística</p>
                </motion.div>
              </div>
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
                {/* Alert Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="text-center mb-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] rounded-full shadow-2xl animate-pulse-glow mb-4">
                    <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                </motion.div>

                {/* Main Headlines */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6 md:mb-8"
                >
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight px-2">
                    🚨 Risco Detectado nas Atividades Digitais
                    <br />
                    <span className="text-[#FF4B4B]">do seu filho(a)!</span>
                  </h1>
                  <p className="text-base md:text-lg text-gray-300 mb-4 max-w-3xl mx-auto px-4">
                    Análise parcial concluída com{" "}
                    <span className="text-[#FF4B4B] font-bold">indícios de atividades perigosas</span> em redes sociais.
                    Desbloqueie o relatório completo para visualizar detalhes e ativar a proteção preventiva.
                  </p>
                </motion.div>

                {/* Profile Section */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8"
                >
                  <img
                    src={
                      profileImage ||
                      `https://ui-avatars.com/api/?name=${childName || "/placeholder.svg"}&background=FF4B4B&color=fff&size=200`
                    }
                    alt="Perfil"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#FF4B4B] shadow-lg"
                  />
                  <div className="text-left">
                    <h3 className="text-white font-bold text-base md:text-lg">{childName}</h3>
                    <p className="text-[#FF4B4B] text-sm font-medium">Status: Risco Detectado</p>
                  </div>
                </motion.div>

                {/* Simulated Report Preview */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="w-full max-w-2xl mx-auto mb-6 md:mb-8"
                >
                  <Card className="bg-gray-900/90 border-2 border-[#FF4B4B] rounded-2xl shadow-2xl overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#1FE3C2] flex-shrink-0" />
                        <h3 className="text-white font-bold text-base md:text-lg">Relatório de Segurança Digital</h3>
                      </div>

                      {/* Report Items */}
                      <div className="space-y-3 md:space-y-4">
                        {/* WhatsApp Alert */}
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 md:p-4">
                          <div className="flex items-center gap-2 md:gap-3 mb-2">
                            <img
                              src="/social-icons/whatsapp.png"
                              alt="WhatsApp"
                              className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
                            />
                            <span className="text-white font-semibold text-sm md:text-base">WhatsApp</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              ALERTA
                            </span>
                          </div>
                          <p className="text-red-400 text-xs md:text-sm mb-2">
                            ⚠️ Conversa suspeita identificada em 22/06/2025
                          </p>
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 relative min-h-[60px]">
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Lock className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-xs md:text-sm font-medium">
                                  🔒 Conteúdo disponível após desbloqueio
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-300 text-xs md:text-sm blur-sm">
                              Mensagem de usuário desconhecido solicitando informações pessoais...
                            </p>
                          </div>
                        </div>

                        {/* Instagram Alert */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 md:p-4">
                          <div className="flex items-center gap-2 md:gap-3 mb-2">
                            <img
                              src="/social-icons/instagram.png"
                              alt="Instagram"
                              className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
                            />
                            <span className="text-white font-semibold text-sm md:text-base">Instagram</span>
                            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                              ATENÇÃO
                            </span>
                          </div>
                          <p className="text-yellow-400 text-xs md:text-sm mb-2">
                            ⚠️ Tentativa de aliciamento detectada
                          </p>
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 relative min-h-[60px]">
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Lock className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-xs md:text-sm font-medium">
                                  🔒 Conteúdo disponível após desbloqueio
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-300 text-xs md:text-sm blur-sm">
                              Perfil suspeito tentando estabelecer contato privado...
                            </p>
                          </div>
                        </div>

                        {/* More Reports Locked */}
                        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 md:p-4 relative min-h-[80px]">
                          <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="w-8 h-8 md:w-10 md:h-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-400 font-medium text-sm md:text-base">
                                +3 alertas adicionais bloqueados
                              </p>
                              <p className="text-gray-500 text-xs md:text-sm">TikTok, Telegram, Snapchat</p>
                            </div>
                          </div>
                          <div className="blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-600 rounded"></div>
                              <span className="text-gray-400 text-sm">Análise completa</span>
                            </div>
                            <p className="text-gray-500 text-xs md:text-sm">Conteúdo detalhado disponível...</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Main CTA */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mb-6"
                >
                  <Button
                    onClick={() => setCurrentStep("news")}
                    className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-3 md:py-4 px-6 md:px-8 text-base md:text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-sm md:max-w-md mb-3 transform hover:scale-105 transition-all duration-300"
                  >
                    <Lock className="w-5 h-5 md:w-6 md:h-6 mr-2" />🔓 Desbloquear Relatório Completo
                  </Button>
                  <p className="text-[#1FE3C2] text-xs md:text-sm font-medium">
                    Acesso único. Garantia incondicional de 7 dias.
                  </p>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-center mb-6"
                >
                  <p className="text-gray-300 text-xs md:text-sm mb-4">
                    Recomendado por <span className="text-[#1FE3C2] font-bold">+50.000 pais</span> em todo o mundo
                  </p>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 md:gap-6 mb-4 flex-wrap">
                    <div className="flex items-center gap-2 text-green-400 text-xs">
                      <Shield className="w-3 h-3 md:w-4 md:h-4" />
                      <span>LGPD</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-xs">
                      <Lock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>SSL</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-xs">
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Segurança</span>
                    </div>
                  </div>

                  {/* Media Logos */}
                  <div className="flex items-center justify-center gap-4 opacity-60">
                    <span className="text-gray-400 text-xs font-medium">BBC</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-400 text-xs font-medium">The Guardian</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-400 text-xs font-medium">CNN</span>
                  </div>
                </motion.div>

                {/* Footer Links */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-4 md:gap-6 text-xs text-gray-500">
                    <button className="hover:text-gray-300 transition-colors">Política de Privacidade</button>
                    <span>•</span>
                    <button className="hover:text-gray-300 transition-colors">Termos de Uso</button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Carrossel de Casos Reais (mantido como estava) */}
        {currentStep === "news" && (
          <motion.div
            key="news"
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
                  Casos Reais que Estamparam Manchetes
                </h2>
                <p className="text-lg md:text-xl text-[#1FE3C2] mb-6">
                  E mostram por que a SafeKid AI é necessária agora.
                </p>
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
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">CASO REAL</span>
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
                  onClick={() => setCurrentStep("final")}
                  className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md"
                >
                  <Shield className="w-6 h-6 mr-2" />
                  Quero Proteger Agora
                </Button>
                <p className="text-gray-400 text-sm mt-4">Não deixe seu filho se tornar a próxima manchete</p>
              </motion.div>
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
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(1px)",
              }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen text-center">
              {/* Alert Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] rounded-full shadow-2xl animate-pulse-glow">
                  <AlertTriangle className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Results */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  🚨 ALERTA CRÍTICO DETECTADO!
                </h2>
                <p className="text-lg md:text-xl text-[#FF4B4B] mb-6">
                  Detectamos <strong>atividade suspeita</strong> no perfil de <strong>{childName}</strong>
                </p>

                {/* Profile and Networks */}
                <div className="flex items-center justify-center gap-6 mb-8">
                  <img
                    src={
                      profileImage ||
                      `https://ui-avatars.com/api/?name=${childName || "/placeholder.svg"}&background=FF4B4B&color=fff&size=200`
                    }
                    alt="Perfil"
                    className="w-20 h-20 rounded-full border-4 border-[#FF4B4B] shadow-lg"
                  />
                  <div className="flex gap-2">
                    {Object.entries(scanResults)
                      .filter(([_, result]) => result.status !== "safe")
                      .map(([network, result], index) => {
                        const networkData = socialNetworks.find((n) => n.name.toLowerCase() === network)
                        return (
                          <div key={network} className="relative">
                            <div className="w-12 h-12 bg-red-500 rounded-full p-2 flex items-center justify-center">
                              <img
                                src={networkData?.icon || "/placeholder.svg"}
                                alt={network}
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4B4B] rounded-full"></div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </motion.div>

              {/* Warning Message */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-[#FF4B4B]/10 border-2 border-[#FF4B4B] rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
              >
                <h3 className="text-xl font-bold text-[#FFCE00] mb-4">
                  A maioria dos pais só descobre quando é tarde demais…
                </h3>
                <p className="text-white text-lg mb-4">Proteja quem você ama enquanto ainda há tempo.</p>

                {/* Risk Details */}
                <div className="text-left space-y-2 text-sm">
                  {Object.entries(scanResults)
                    .filter(([_, result]) => result.status !== "safe")
                    .map(([network, result]) => (
                      <div key={network} className="flex items-start gap-2">
                        <span className="text-[#FF4B4B] font-bold">•</span>
                        <span className="text-gray-300">
                          <strong className="text-white capitalize">{network}:</strong> {result.message}
                        </span>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Final CTA */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                <Button
                  onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                  className="bg-gradient-to-r from-[#1FE3C2] to-[#885EFF] hover:from-[#1BD4B8] hover:to-[#7B52FF] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md mb-4"
                >
                  <Shield className="w-6 h-6 mr-2" />
                  Receber Relatório Completo
                </Button>
                <p className="text-gray-400 text-sm">
                  🔒 Proteção garantida • ⚡ Suporte 24/7 • ✅ Resultados imediatos
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
