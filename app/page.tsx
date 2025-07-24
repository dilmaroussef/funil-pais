"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback, lazy } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Clock,
  MessageCircle,
  CheckCircle,
  Star,
  Bell,
  CreditCard,
  Gift,
  BookOpen,
  Infinity,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CountryPhoneInput } from "@/components/country-phone-input"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Checkbox } from "@/components/ui/checkbox"

// Lazy load components for better performance
const LazyImage = lazy(() => import("next/image"))

type Step =
  | "welcome"
  | "headlines"
  | "form"
  | "scanning"
  | "chat-simulation"
  | "conversion"
  | "final"
  | "checkout"
  | "upsell1"
  | "upsell2"
  | "upsell3"
  | "thank-you"

interface WhatsAppProfileResponse {
  success: boolean
  result?: string
  is_photo_private?: boolean
  phone_number?: string
  error?: string
}

interface Notification {
  id: number
  message: string
  timestamp: Date
}

interface PurchaseData {
  mainProduct: boolean
  orderBump: boolean
  upsell1: boolean
  upsell2: boolean
  upsell3: boolean
  totalAmount: number
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
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [chatMessageIndex, setChatMessageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [protectedFamilies, setProtectedFamilies] = useState(342)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showBumpOffer, setShowBumpOffer] = useState(false)
  const [orderBumpSelected, setOrderBumpSelected] = useState(false)
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    mainProduct: true,
    orderBump: false,
    upsell1: false,
    upsell2: false,
    upsell3: false,
    totalAmount: 27,
  })
  const [scanResults, setScanResults] = useState({
    telegram: { status: "safe", message: "Sem riscos detectados" },
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
    "👩‍🦰 Mãe de Lucas desbloqueou o relatório há 2 minutos",
    "🧑 João (RJ) ativou proteção agora mesmo",
    "👩 Ana (SP) descobriu atividade suspeita há 1 minuto",
    "🧔 Carlos (MG) protegeu sua filha há 3 minutos",
    "👩‍🦱 Maria (PR) desbloqueou análise completa agora",
  ]

  // Notificações em tempo real
  const realTimeNotifications = [
    "👩‍🦰 Mãe de Lucas acabou de desbloquear",
    "👀 Nova verificação concluída há 1 min",
    "🧑 João (RJ) ativou proteção agora mesmo",
    "👩 Ana descobriu atividade suspeita",
    "🔍 Relatório gerado há 30 segundos",
  ]

  // Simulação de conversa suspeita
  const suspiciousChat = [
    { sender: "stranger", message: "Você parece mais madura que sua idade...", time: "19:03" },
    { sender: "child", message: "Sério? Rs", time: "19:04" },
    { sender: "stranger", message: "Vamos manter isso entre nós, ok?", time: "19:05" },
    { sender: "stranger", message: "Você tem WhatsApp? Podemos conversar melhor lá", time: "19:06" },
    { sender: "child", message: "Não sei...", time: "19:07" },
    { sender: "stranger", message: "Confie em mim, sou diferente dos outros", time: "19:08" },
  ]

  // Depoimentos reais
  const realTestimonials = [
    {
      name: "Carlos M.",
      child: "pai da Isadora",
      text: "Nunca pensei que minha filha pudesse estar conversando com um estranho assim. O SafeKid AI me mostrou coisas que eu jamais imaginava.",
      avatar: "/testimonials/carlos-testimonial.jpg",
      verified: true,
    },
    {
      name: "Mariana R.",
      child: "mãe da Laura",
      text: "Eu achava que minha filha estava segura. Quando vi o que estavam mandando pra ela no Snapchat, entrei em choque. Ainda bem que descobri a tempo.",
      avatar: "/testimonials/mariana-testimonial.jpg",
      verified: true,
    },
  ]

  // Comentários estilo rede social
  const socialComments = [
    {
      name: "Rodrigo M.",
      time: "há 2 horas",
      comment:
        "Usei ontem e fiquei em choque. O que vi no TikTok da minha filha me fez chorar. Obrigado por essa ferramenta.",
      avatar: "/testimonials/rodrigo-comment.jpg",
    },
    {
      name: "Patricia S.",
      time: "há 4 horas",
      comment: "Meu filho estava sendo manipulado no Discord e eu não sabia. Essa análise salvou nossa família.",
      avatar: "/testimonials/patricia-comment.jpg",
    },
  ]

  // Variações de CTA para teste A/B
  const ctaVariants = [
    { text: "🔓 Desbloquear Relatório Completo", icon: Lock },
    { text: "🔒 Proteger Meu Filho Agora", icon: Shield },
    { text: "🔍 Ver Relatório Urgente", icon: Eye },
    { text: "⚡ Desbloquear em Tempo Real", icon: AlertTriangle },
  ]

  // FAQ Data
  const faqData = [
    {
      question: "Isso funciona com qualquer rede social?",
      answer:
        "Sim! Nossa tecnologia analisa Instagram, TikTok, WhatsApp, Telegram, Snapchat, Discord e mais de 15 plataformas digitais onde seu filho pode estar interagindo.",
    },
    {
      question: "É seguro para meus dados?",
      answer:
        "Absolutamente. Utilizamos criptografia de nível bancário e seguimos rigorosamente a LGPD. Seus dados são processados de forma segura e nunca compartilhados com terceiros.",
    },
    {
      question: "É uma assinatura?",
      answer:
        "Não! É um pagamento único de $27 que inclui o relatório completo + 30 dias de monitoramento gratuito. Sem renovação automática ou taxas ocultas.",
    },
    {
      question: "O que acontece após o pagamento?",
      answer:
        "Você recebe acesso imediato ao relatório completo por e-mail e WhatsApp. O monitoramento contínuo começa automaticamente e você recebe alertas em tempo real.",
    },
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

  // Detectar tentativa de saída
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep === "conversion" || currentStep === "final" || currentStep === "checkout") {
        setShowExitPopup(true)
        e.preventDefault()
        e.returnValue = ""
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && (currentStep === "conversion" || currentStep === "final" || currentStep === "checkout")) {
        setShowExitPopup(true)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [currentStep])

  // Timer countdown
  useEffect(() => {
    if (currentStep === "conversion" || currentStep === "final" || currentStep === "checkout") {
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

  // Contador de famílias protegidas
  useEffect(() => {
    if (currentStep === "final" || currentStep === "checkout") {
      const interval = setInterval(() => {
        setProtectedFamilies((prev) => prev + Math.floor(Math.random() * 3))
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Notificações em tempo real
  useEffect(() => {
    if (currentStep === "final" || currentStep === "checkout") {
      const interval = setInterval(() => {
        const newNotification: Notification = {
          id: Date.now(),
          message: realTimeNotifications[Math.floor(Math.random() * realTimeNotifications.length)],
          timestamp: new Date(),
        }

        setNotifications((prev) => {
          const updated = [newNotification, ...prev].slice(0, 3)
          return updated
        })

        // Remove notification after 4 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
        }, 4000)
      }, 6000)

      return () => clearInterval(interval)
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

  // Handle order bump selection
  const handleOrderBumpChange = (checked: boolean) => {
    setOrderBumpSelected(checked)
    setPurchaseData((prev) => ({
      ...prev,
      orderBump: checked,
      totalAmount: checked ? 44 : 27, // $27 + $17
    }))
  }

  // Handle main checkout
  const handleMainCheckout = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep("upsell1")
      setIsTransitioning(false)
    }, 2000)
  }

  // Handle upsell purchases
  const handleUpsellPurchase = (upsellNumber: 1 | 2 | 3, price: number) => {
    setPurchaseData((prev) => ({
      ...prev,
      [`upsell${upsellNumber}`]: true,
      totalAmount: prev.totalAmount + price,
    }))

    setIsTransitioning(true)
    setTimeout(() => {
      if (upsellNumber === 1) setCurrentStep("upsell2")
      else if (upsellNumber === 2) setCurrentStep("upsell3")
      else setCurrentStep("thank-you")
      setIsTransitioning(false)
    }, 1500)
  }

  // Handle upsell skip
  const handleUpsellSkip = (upsellNumber: 1 | 2 | 3) => {
    if (upsellNumber === 1) setCurrentStep("upsell2")
    else if (upsellNumber === 2) setCurrentStep("upsell3")
    else setCurrentStep("thank-you")
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
    return "⚠️ Só este mês, 57 casos foram registrados em Pindamonhangaba."
  }

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6">
        <LoadingSpinner message="Carregando verificação..." />
      </div>
    </div>
  )

  // Floating Notifications Component
  const FloatingNotifications = () => (
    <div className="fixed bottom-4 left-4 z-40 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1FE3C2]" />
              <span className="text-sm text-gray-700 font-medium">{notification.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="min-h-screen font-sans">
      {/* Loading Overlay */}
      {isTransitioning && <LoadingOverlay />}

      {/* Floating Notifications */}
      <FloatingNotifications />

      {/* Pop-up de Urgência para Abandono */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">⚠️ {childName} ainda pode estar em perigo</h3>
              <p className="text-gray-600 mb-6">Você quer mesmo sair sem visualizar o relatório completo?</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowExitPopup(false)}
                  className="flex-1 bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] text-white"
                >
                  PROTEGER AGORA
                </Button>
                <Button
                  onClick={() => window.close()}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600"
                >
                  SAIR SEM VER
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  Iniciar Verificação Gratuita
                </Button>
                <p className="text-gray-400 text-sm mt-4">
                  🔒 100% Confidencial • ⚡ Análise em tempo real • ✅ Usado por +50.000 famílias
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
                        onChange={(e) => setChildName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Número do filho */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Número do filho(a)</label>
                      <CountryPhoneInput
                        value={whatsappNumber}
                        onChange={handlePhoneChange}
                        placeholder="Digite o número"
                        className="text-base"
                      />

                      {/* Exibição da foto de perfil */}
                      {whatsappNumber.replace(/\D/g, "").length >= 8 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                            {isLoadingProfile ? "Buscando foto de perfil..." : "Foto de perfil detectada:"}
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
                      disabled={!canProceed() || isTransitioning}
                      className="w-full bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 text-lg rounded-xl btn-enhanced disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoadingProfile || isTransitioning ? (
                        <>
                          <LoadingSpinner size="sm" message="" />
                          <span className="ml-2">
                            {isTransitioning ? "Iniciando análise..." : "Verificando perfil..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Iniciar Análise Forense
                        </>
                      )}
                    </Button>

                    {canProceed() && !isLoadingProfile && !isTransitioning && (
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
                        `https://ui-avatars.com/api/?name=${childName || "User"}&background=885EFF&color=fff&size=200`
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
                    <span>Conexão segura e criptografada</span>
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
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">🚨 Conversa Suspeita Detectada</h2>
                <p className="text-lg text-red-400 mb-6">
                  Exemplo do tipo de conversa encontrada no perfil de <strong>{childName}</strong>
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
                      <h4 className="text-white font-semibold">Usuário Desconhecido</h4>
                      <p className="text-gray-400 text-xs">Online agora</p>
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
                    Continuar Análise →
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
                <h3 className="text-xl font-bold text-red-400 mb-2">⚠️ PADRÃO DE ALICIAMENTO IDENTIFICADO</h3>
                <p className="text-white mb-4">
                  Esta é apenas uma amostra. O relatório completo contém análise detalhada de todas as conversas
                  suspeitas.
                </p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Tentativa de isolamento ("entre nós")</p>
                  <p>• Elogios inadequados para a idade</p>
                  <p>• Solicitação de contato privado</p>
                  <p>• Construção de confiança falsa</p>
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
                  onClick={() => handleStepTransition("form")}
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
                      <span className="text-red-400 font-bold">ACESSO LIMITADO</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatTime(timeLeft)}</div>
                    <p className="text-red-300 text-sm">Tempo restante para acessar o relatório</p>
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
                    🚨 ANÁLISE COMPLETA DE <span className="text-red-400">{childName.toUpperCase()}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-[#FFCE00] font-semibold mb-4">
                    Foram detectadas <span className="text-red-400 font-bold">4 situações de risco</span> que requerem
                    atenção imediata
                  </p>
                  <div className="text-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      RELATÓRIO CONFIDENCIAL
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
                      risk: "ALTO",
                      issue: "Tentativa de aliciamento detectada",
                      color: "border-red-500 bg-red-500/10",
                      icon: "❌",
                    },
                    {
                      platform: "Snapchat",
                      risk: "CRÍTICO",
                      issue: "Interação com perfil desconhecido",
                      color: "border-red-600 bg-red-600/20",
                      icon: "🚨",
                    },
                    {
                      platform: "TikTok",
                      risk: "ALTO",
                      issue: "Conteúdo impróprio visualizado",
                      color: "border-red-500 bg-red-500/10",
                      icon: "⚠️",
                    },
                    {
                      platform: "WhatsApp",
                      risk: "CRÍTICO",
                      issue: "Conversa suspeita identificada",
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
                          RISCO {item.risk}
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
                  className="text-center"
                >
                  <Button
                    onClick={() => handleStepTransition("checkout")}
                    className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md transform hover:scale-105 transition-all duration-200"
                  >
                    {React.createElement(ctaVariants[ctaVariant].icon, { className: "w-6 h-6 mr-2" })}
                    Get Complete Report - $27
                  </Button>
                  <p className="text-gray-400 text-sm mt-4">
                    🔒 Secure Payment • ⚡ Instant Access • 🛡️ 7-Day Guarantee
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
                    <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
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
                        {testimonial.verified && <CheckCircle className="w-5 h-5 text-[#1FE3C2]" />}
                      </div>
                      <p className="text-gray-300 text-sm italic">"{testimonial.text}"</p>
                      <div className="flex text-[#FFCE00] mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
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
                    <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-start gap-3">
                        <img
                          src={comment.avatar || "/placeholder.svg"}
                          alt={comment.name}
                          className="w-10 h-10 rounded-full object-cover"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold text-sm">{comment.name}</h4>
                            <span className="text-gray-400 text-xs">{comment.time}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Página Final de Oferta */}
        {currentStep === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50"
          >
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              {/* Chamada Personalizada */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] rounded-2xl p-6 text-center mb-8"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🔐 Complete Report Ready for: <span className="text-yellow-300">{childName}</span>
                </h1>
                <p className="text-white/90">Unlock now and protect your child from digital threats</p>
              </motion.div>

              {/* Progresso da Missão */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🧩 Verification Progress: <span className="text-[#1FE3C2]">92% Complete</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Detection completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Report generated</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 font-semibold">Final access unlock pending</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={92} className="h-3" />
                </div>
              </motion.div>

              {/* CTA Principal */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <Button
                  onClick={() => handleStepTransition("checkout")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 px-8 text-xl rounded-xl shadow-2xl mb-4 transform hover:scale-105 transition-all duration-200"
                >
                  <motion.div
                    animate={{ rotate: [0, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mr-3"
                  >
                    🔓
                  </motion.div>
                  Get Complete Report - $27
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Página de Checkout */}
        {currentStep === "checkout" && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50"
          >
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 SafeKid AI – Complete Digital Report</h1>
                <p className="text-gray-600">Secure checkout - Your information is protected</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Details */}
                <div className="space-y-6">
                  {/* Main Product */}
                  <Card className="border-2 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">SafeKid AI Digital Report</h3>
                          <ul className="text-sm text-gray-600 space-y-1 mb-4">
                            <li>✓ Social media scanning</li>
                            <li>✓ Suspicious profile and message detection</li>
                            <li>✓ Psychological manipulation analysis</li>
                            <li>✓ Immediate and confidential delivery</li>
                          </ul>
                          <div className="text-2xl font-bold text-blue-600">$27</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Bump */}
                  <Card
                    className={`border-2 transition-all duration-200 ${orderBumpSelected ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={orderBumpSelected}
                          onCheckedChange={handleOrderBumpChange}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-gray-800">🛡️ 30-Day Continuous Protection</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Receive automatic alerts if new risks are detected. Includes weekly re-analysis and special
                            support.
                          </p>
                          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-800 font-medium">
                              ✅ Add for just <span className="font-bold">+$17</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary & Payment */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>SafeKid AI Digital Report</span>
                          <span>$27.00</span>
                        </div>
                        {orderBumpSelected && (
                          <div className="flex justify-between text-blue-600">
                            <span>30-Day Protection</span>
                            <span>$17.00</span>
                          </div>
                        )}
                        <hr />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${purchaseData.totalAmount}.00</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Form */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input type="email" placeholder="your@email.com" className="w-full" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <Input type="text" placeholder="John Doe" className="w-full" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <Input type="text" placeholder="1234 5678 9012 3456" className="w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                            <Input type="text" placeholder="MM/YY" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                            <Input type="text" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Purchase Button */}
                  <Button
                    onClick={handleMainCheckout}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Complete Purchase - ${purchaseData.totalAmount}
                  </Button>

                  {/* Security Badges */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span>SSL Encrypted</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>Secure Payment</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Protected by 256-bit SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upsell 1 - Family Protection */}
        {currentStep === "upsell1" && (
          <motion.div
            key="upsell1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"
          >
            <div className="max-w-2xl mx-auto px-4 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gift className="w-10 h-10 text-white" />
                  </div>

                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    🎁 Protect Your Entire Family with SafeKid AI
                  </h1>

                  <div className="text-left mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Monitoring for up to 3 profiles</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Monthly reports via WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Complete activity history</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Exclusive family support</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">Only $47</div>
                    <p className="text-gray-600">One-time payment for complete family protection</p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => handleUpsellPurchase(1, 47)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg rounded-xl"
                    >
                      YES, PROTECT MY FAMILY
                    </Button>

                    <button
                      onClick={() => handleUpsellSkip(1)}
                      className="w-full text-gray-500 hover:text-gray-700 underline"
                    >
                      No thanks, continue with single report
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Upsell 2 - Anti-Manipulation Guide */}
        {currentStep === "upsell2" && (
          <motion.div
            key="upsell2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center"
          >
            <div className="max-w-2xl mx-auto px-4 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>

                  <h1 className="text-3xl font-bold text-gray-800 mb-4">🧠 Help Your Child Recognize Online Threats</h1>

                  <div className="text-left mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>📘 Interactive Guide: How to avoid digital traps</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✅ Practical strategies for parents</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✅ Accessible and educational language</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✅ Immediate delivery via email</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-6 mb-6">
                    <div className="text-4xl font-bold text-orange-600 mb-2">Only $20</div>
                    <p className="text-gray-600">Digital product (PDF + bonus videos)</p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => handleUpsellPurchase(2, 20)}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 text-lg rounded-xl"
                    >
                      YES, I WANT THIS GUIDE
                    </Button>

                    <button
                      onClick={() => handleUpsellSkip(2)}
                      className="w-full text-gray-500 hover:text-gray-700 underline"
                    >
                      No thanks, continue
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Upsell 3 - Lifetime Monitor */}
        {currentStep === "upsell3" && (
          <motion.div
            key="upsell3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center"
          >
            <div className="max-w-2xl mx-auto px-4 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Infinity className="w-10 h-10 text-white" />
                  </div>

                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    🛡️ SafeKid Monitor Lifetime – Protection Forever
                  </h1>

                  <div className="text-left mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Continuous monitoring without expiration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Automatic monthly analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Immediate alerts for new threats</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>✔️ Lifetime support included</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 mb-6">
                    <div className="text-4xl font-bold text-purple-600 mb-2">One-time $97</div>
                    <p className="text-gray-600">Never pay again - lifetime protection</p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => handleUpsellPurchase(3, 97)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 text-lg rounded-xl"
                    >
                      ACTIVATE LIFETIME PROTECTION
                    </Button>

                    <button
                      onClick={() => handleUpsellSkip(3)}
                      className="w-full text-gray-500 hover:text-gray-700 underline"
                    >
                      No thanks, continue to my report
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Página de Agradecimento */}
        {currentStep === "thank-you" && (
          <motion.div
            key="thank-you"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center"
          >
            <div className="max-w-3xl mx-auto px-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">🎉 Mission Accomplished!</h1>
                <p className="text-xl text-gray-600 mb-6">
                  You have successfully activated digital protection for <strong>{childName}</strong>.
                </p>

                {/* Purchase Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Purchase Summary</h2>
                  <div className="space-y-4 text-left max-w-md mx-auto">
                    <div className="flex justify-between items-center">
                      <span>✅ SafeKid AI Digital Report</span>
                      <span className="font-bold">$27</span>
                    </div>
                    {purchaseData.orderBump && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span>✅ 30-Day Protection</span>
                        <span className="font-bold">$17</span>
                      </div>
                    )}
                    {purchaseData.upsell1 && (
                      <div className="flex justify-between items-center text-purple-600">
                        <span>✅ Family Protection</span>
                        <span className="font-bold">$47</span>
                      </div>
                    )}
                    {purchaseData.upsell2 && (
                      <div className="flex justify-between items-center text-orange-600">
                        <span>✅ Anti-Manipulation Guide</span>
                        <span className="font-bold">$20</span>
                      </div>
                    )}
                    {purchaseData.upsell3 && (
                      <div className="flex justify-between items-center text-indigo-600">
                        <span>✅ Lifetime Monitor</span>
                        <span className="font-bold">$97</span>
                      </div>
                    )}
                    <hr className="my-4" />
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total Paid:</span>
                      <span className="text-green-600">${purchaseData.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Next Steps:</h2>
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <span>Check your email to download the complete report</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <span>Continuous monitoring is now active</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <span>You'll receive real-time alerts on WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* Support Contact */}
                <div className="bg-gray-100 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Need Support?</h3>
                  <p className="text-gray-600 mb-4">Our team is here to help you 24/7</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Support
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Mail className="w-4 h-4" />
                      Email Support
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] text-white font-bold py-3 px-8 rounded-xl"
                >
                  Protect Another Child
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
