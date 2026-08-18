# 🎨 Guide de Développement Frontend - TouriBook

## Structure du Projet

```
frontend/
├── apps/
│   ├── client/          # Next.js SSR/SEO - Site client (port 5173)
│   └── admin/           # Vite React - Panel admin (port 5174/admin)
├── packages/            # Packages partagés
│   ├── @touribook/ui    # Composants réutilisables
│   ├── @touribook/api   # Client API / services
│   ├── @touribook/auth  # Logique d'authentification
│   └── @touribook/i18n  # Internationalisation (i18n)
├── package.json         # Workspace root (monorepo)
└── tsconfig.json        # Config TypeScript partagée
```

---

## 🚀 Démarrage Rapide

### Terminal 1 : Frontend
```powershell
cd C:\Users\LENOVO\OneDrive\Desktop\TouriDes\frontend
npm run dev
```

**URLs d'accès** :
- Client : http://localhost:5173
- Admin  : http://localhost:5174/admin

### Terminal 2 : Backend (optionnel pour le design)
```powershell
cd C:\Users\LENOVO\OneDrive\Desktop\TouriDes
.\scripts\dev.ps1        # Require PostgreSQL + Docker
# ou
.\scripts\dev.ps1 -Seed  # Avec création de l'admin initial
```

**URLs backend** :
- API Gateway : http://localhost:8000
- Swagger (gateway) : http://localhost:8000/docs
- Services individuels : http://localhost:800X/docs (X = 1-7)

---

## 📂 Architecture des Apps

### Client App (`apps/client/`)
- **Framework** : Next.js (SSR/SSG)
- **Port** : 5173
- **Cas d'usage** : Site public, booking en ligne
- **Features** : SEO, server-side rendering, API routes

**Structure** :
```
apps/client/
├── app/                  # App Router (Next.js 13+)
│   ├── layout.tsx       # Layout racine
│   ├── page.tsx         # Home page
│   ├── activities/      # Routes activités
│   ├── booking/         # Flux de réservation
│   └── api/             # API routes locales
├── components/          # Composants React
├── lib/                 # Utilities
├── styles/              # CSS/Tailwind
└── public/              # Assets statiques
```

### Admin App (`apps/admin/`)
- **Framework** : Vite + React
- **Port** : 5174/admin
- **Cas d'usage** : Gestion interne, dashboards
- **Features** : SPA rapide, rechargement instantané (HMR)

**Structure** :
```
apps/admin/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── pages/          # Pages admin
│   ├── services/       # Logique métier
│   ├── lib/            # Utilities
│   ├── styles/         # CSS
│   └── App.tsx         # Entrée application
└── vite.config.ts      # Config Vite
```

---

## 🎯 Packages Partagés

### `@touribook/ui`
Composants design réutilisables :
- Buttons, Cards, Modals, Forms
- Thème centralisé (couleurs, typo)
- Storybook pour la documentation

**Usage** :
```typescript
import { Button, Card, Input } from '@touribook/ui'
```

### `@touribook/api`
Client API + services d'intégration :
- Requêtes vers le gateway (http://localhost:8000)
- Gestion des erreurs
- Intercepteurs (token JWT, etc.)

**Usage** :
```typescript
import { ApiClient, useActivities } from '@touribook/api'
```

### `@touribook/auth`
Authentification centralisée :
- Login/Register
- Token storage (localStorage/secure)
- Context/Provider

**Usage** :
```typescript
import { useAuth, ProtectedRoute } from '@touribook/auth'
```

### `@touribook/i18n`
Traductions FR/EN :
- i18n-js ou react-i18next
- Dictionnaires JSON

**Usage** :
```typescript
import { useTranslation } from '@touribook/i18n'
const { t } = useTranslation()
```

---

## 💻 Commandes Utiles

### Développement
```powershell
# Lancer tout le frontend
npm run dev

# Lancer juste le client
npm run dev -w @touribook/client

# Lancer juste l'admin
npm run dev -w @touribook/admin

# Lancer un package spécifique
npm run dev -w @touribook/ui
```

### Build
```powershell
# Build prod
npm run build

# Build client uniquement
npm run build -w @touribook/client

# Build admin uniquement
npm run build -w @touribook/admin
```

### Lint & Format
```powershell
# ESLint
npm run lint

# Prettier (formatage)
npm run format

# ESLint + fix
npm run lint --fix
```

### Tests
```powershell
# Jest/Vitest
npm run test

# Avec watch
npm run test --watch

# Coverage
npm run test --coverage
```

---

## 🎨 Conventions de Développement

### Naming
- **Composants React** : PascalCase (`MyButton.tsx`)
- **Fichiers utiles** : kebab-case (`use-auth.ts`, `api-client.ts`)
- **Dossiers** : kebab-case (`components/`, `lib/`)

### Imports
```typescript
// Préféré
import { Component } from '@touribook/ui'
import { useAuth } from '@touribook/auth'
import { Button } from './components/Button'

// Éviter les imports relatifs longs
// ❌ import Component from '../../../components/Button'
```

### Composants React
```typescript
interface MyComponentProps {
  title: string
  onClick?: () => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onClick 
}) => {
  return <button onClick={onClick}>{title}</button>
}
```

### API Calls
```typescript
import { useQuery } from '@tanstack/react-query'
import { ApiClient } from '@touribook/api'

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => ApiClient.activities.list(),
  })
}
```

---

## 🔗 Intégration Backend

### Endpoints Gateway (http://localhost:8000)
```
GET    /health                    # Santé services
GET    /activities                # Catalog service
POST   /auth/login                # Auth service
POST   /auth/register
GET    /bookings                  # Booking service
POST   /bookings
POST   /payments                  # Payment service
GET    /reviews                   # Review service
POST   /admin/users               # Admin service
```

### Exemple : Authentification
```typescript
// packages/auth/useAuth.ts
import { useMutation } from '@tanstack/react-query'
import { ApiClient } from '@touribook/api'

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginInput) =>
      ApiClient.auth.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token)
      // Redirection, etc.
    },
  })
}
```

---

## 🧪 Tests

### Structure
```
src/components/__tests__/
├── MyComponent.test.tsx
└── MyComponent.stories.tsx    # Storybook stories
```

### Exemple Test
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

## 📚 Tech Stack

| Layer | Tech |
|-------|------|
| **Runtime** | Node.js 22.x |
| **Package Manager** | npm |
| **Monorepo** | npm workspaces |
| **Client** | Next.js 14+ |
| **Admin** | Vite + React 18+ |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS / CSS Modules |
| **UI Components** | Radix UI / Headless UI |
| **State** | React Query / Zustand / Context |
| **Forms** | React Hook Form + Zod/Yup |
| **Routing** | Next.js App Router (client) / React Router (admin) |
| **HTTP** | Axios / Fetch |
| **Testing** | Jest / Vitest + Testing Library |
| **Linting** | ESLint + Prettier |

---

## 🚨 Troubleshooting

### Port déjà utilisé
```powershell
# Trouver le processus
netstat -ano | findstr :5173

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

### Dépendances manquantes
```powershell
# Nettoyer cache npm
npm cache clean --force
rm node_modules package-lock.json
npm install
```

### Changements non détectés (HMR)
```powershell
# Redémarrer le serveur
Ctrl+C dans le terminal
npm run dev
```

### API non disponible
- Vérifier que le backend est lancé : `.\scripts\dev.ps1`
- Vérifier l'URL du gateway dans `.env.local`
- Voir les logs du gateway : http://localhost:8000/health

---

## 📖 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [Vite Docs](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query/latest)

---

## 👤 Admin Initial

**Email** : `alibenjannette@gmail.com`  
**Password** : `Admin@1234`  
**Panel** : http://localhost:5174/admin

---

**Bon développement ! 🚀**
