This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# ZenTask Solo

Un sistema di gestione interventi moderno e reattivo costruito con Next.js, TypeScript e Tailwind CSS.

## 🚀 Caratteristiche

- **Dashboard Centrale**: Monitora e gestisci tutti gli interventi da un'unica dashboard
- **Gestione Completa**: Clienti, utenti, attività e stati
- **Autenticazione**: Sistema di login sicuro con ruoli admin/operatore
- **Design Responsivo**: Interfaccia ottimizzata per desktop e mobile
- **Tema Scuro/Chiaro**: Supporto completo per entrambi i temi
- **Componenti Riutilizzabili**: Architettura modulare e scalabile

## 📱 Tabelle Mobile-Friendly

ZenTask implementa un sistema di visualizzazione adattivo per le tabelle:

### **Desktop**: Tabelle Tradizionali
- Layout a colonne completo
- Tutte le informazioni visibili
- Sorting e filtering avanzati

### **Mobile**: Card View
- **Dashboard**: Card compatte con status e metriche
- **Clienti**: Card con avatar, badge tipo cliente, e azioni
- **Utenti**: Card con avatar, ruolo, e informazioni contatto
- **Touch-Friendly**: Azioni facilmente accessibili
- **Ricerca**: Funziona identicamente su mobile

### Implementazione Tecnica

Il componente `GenericDataTable` rileva automaticamente il dispositivo e:
- Usa `useIsMobile()` hook per detection
- Renderizza tabelle su desktop
- Renderizza card su mobile tramite `mobileCardRender` prop
- Mantiene tutte le funzionalità (ricerca, paginazione, azioni)

```tsx
<GenericDataTable
  data={data}
  columns={columns}
  mobileCardRender={renderCustomCard}  // Abilita card view
  // ... altre props
/>
```

## 🛠 Tecnologie

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Icons**: Tabler Icons
- **State Management**: React Context
- **Data Tables**: TanStack Table
- **Notifications**: Sonner
- **Themes**: next-themes

## 🏗 Architettura

### Componenti Layout
- `PageLayout`: Layout base con sidebar e header
- `ManagementPageLayout`: Layout specializzato per pagine gestionali
- `ContentWrapper`: Wrapper con padding consistente
- `PageHeader`: Header standardizzato per tutte le pagine

### Componenti UI
- `GenericDataTable`: Tabella riutilizzabile con card view mobile
- `AppSidebar`: Sidebar responsive con navigazione
- `SiteHeader`: Header con breadcrumb e azioni
- `ThemeToggle`: Switcher tema scuro/chiaro

## 📦 Installazione

```bash
git clone <repository-url>
cd zentask-solo
npm install
npm run dev
```

## 🎨 Design System

- **Colori**: Sistema di design tokens per tema scuro/chiaro
- **Spacing**: Padding e margin consistenti (`px-4 lg:px-6`)
- **Typography**: Font Geist per leggibilità ottimale
- **Componenti**: Libreria shadcn/ui completamente tipizzata

## 📱 Mobile Experience

- **FAB**: Floating Action Button per azioni rapide
- **Sheet**: Bottom sheet su mobile, side sheet su desktop
- **Card View**: Visualizzazione ottimizzata per touch
- **Responsive**: Breakpoint intelligenti per tutti i dispositivi
