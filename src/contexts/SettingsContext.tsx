"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SettingsContextType {
  companyName: string
  updateCompanyName: (name: string) => void
  companyDescription: string
  updateCompanyDescription: (description: string) => void
  companyLogo: string | null
  updateCompanyLogo: (logo: string | null) => void
  userAvatar: string
  updateUserAvatar: (avatar: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [companyName, setCompanyName] = useState("ZenTask")
  const [companyDescription, setCompanyDescription] = useState("Gestione Interventi")
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState("/avatars/admin.jpg")

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedCompanyName = localStorage.getItem("zentask_company_name")
    const savedCompanyDescription = localStorage.getItem("zentask_company_description")
    const savedCompanyLogo = localStorage.getItem("zentask_company_logo")
    const savedUserAvatar = localStorage.getItem("zentask_user_avatar")

    if (savedCompanyName) setCompanyName(savedCompanyName)
    if (savedCompanyDescription) setCompanyDescription(savedCompanyDescription)
    if (savedCompanyLogo) setCompanyLogo(savedCompanyLogo)
    if (savedUserAvatar) setUserAvatar(savedUserAvatar)
  }, [])

  const updateCompanyName = (name: string) => {
    setCompanyName(name)
    localStorage.setItem("zentask_company_name", name)
  }

  const updateCompanyDescription = (description: string) => {
    setCompanyDescription(description)
    localStorage.setItem("zentask_company_description", description)
  }

  const updateCompanyLogo = (logo: string | null) => {
    setCompanyLogo(logo)
    if (logo) {
      localStorage.setItem("zentask_company_logo", logo)
    } else {
      localStorage.removeItem("zentask_company_logo")
    }
  }

  const updateUserAvatar = (avatar: string) => {
    setUserAvatar(avatar)
    localStorage.setItem("zentask_user_avatar", avatar)
  }

  return (
    <SettingsContext.Provider
      value={{
        companyName,
        updateCompanyName,
        companyDescription,
        updateCompanyDescription,
        companyLogo,
        updateCompanyLogo,
        userAvatar,
        updateUserAvatar,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
