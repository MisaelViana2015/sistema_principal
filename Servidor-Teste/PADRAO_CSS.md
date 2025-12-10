# 🎨 PADRÃO DE ESTILIZAÇÃO - ROTA VERDE

## ⚠️ REGRA DE OURO: SEMPRE CSS INLINE

**NUNCA use:**
- ❌ TailwindCSS
- ❌ CSS Modules
- ❌ Styled Components
- ❌ Bibliotecas CSS externas

**SEMPRE use:**
- ✅ CSS Inline (style={{ }})
- ✅ Arquivo CSS simples (index.css)
- ✅ Variáveis CSS (--var-name)

---

## 🎯 POR QUÊ CSS INLINE?

### Vantagens:
1. **Zero configuração** - não precisa instalar nada
2. **Nunca dá erro de build** - sem dependências extras
3. **Build super rápido** - sem processamento CSS
4. **Fácil de manter** - tudo visível no componente
5. **Sem conflitos** - cada componente é isolado
6. **TypeScript nativo** - autocomplete de propriedades

### Comparação:
```
TailwindCSS: 3 dependências + configuração + 500ms build
CSS Inline:  0 dependências + 0 configuração + 50ms build
```

---

## 📖 EXEMPLOS

### Componente Básico:
```tsx
export default function Card() {
  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#111827'
      }}>
        Título
      </h2>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        Conteúdo
      </p>
    </div>
  );
}
```

### Com Variáveis (para reutilização):
```tsx
const styles = {
  card: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#111827'
  },
  text: {
    fontSize: '0.875rem',
    color: '#6b7280'
  }
} as const;

export default function Card() {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Título</h2>
      <p style={styles.text}>Conteúdo</p>
    </div>
  );
}
```

### Dark Mode:
```tsx
const styles = {
  card: (isDark: boolean) => ({
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    color: isDark ? '#fff' : '#000',
    padding: '1rem',
    borderRadius: '0.5rem'
  })
};

export default function Card() {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <div style={styles.card(isDark)}>
      Conteúdo
    </div>
  );
}
```

### Responsivo (com media queries):
```tsx
// No index.css (se necessário):
@media (max-width: 768px) {
  .mobile-hidden {
    display: none;
  }
}

// No componente:
<div 
  className="mobile-hidden"
  style={{
    padding: '1rem',
    backgroundColor: '#fff'
  }}
>
  Desktop only
</div>
```

---

## 🎨 PALETA DE CORES PADRÃO

```tsx
const colors = {
  // Backgrounds
  bg: {
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    dark: '#1a1a1a',
    darkCard: '#2d3748'
  },
  
  // Text
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af',
    white: '#ffffff'
  },
  
  // Theme colors
  green: {
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },
  
  blue: {
    500: '#3b82f6',
    600: '#2563eb'
  },
  
  red: {
    500: '#ef4444',
    600: '#dc2626'
  },
  
  yellow: {
    500: '#eab308',
    600: '#ca8a04'
  },
  
  purple: {
    500: '#a855f7',
    600: '#9333ea'
  },
  
  // Borders
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#374151'
  }
} as const;
```

---

## ✅ CHECKLIST ANTES DE CRIAR COMPONENTE

- [ ] Vou usar `style={{ }}` para estilização?
- [ ] Se precisar reutilizar, criei object `styles`?
- [ ] Dark mode funcionando?
- [ ] Cores da paleta padrão?
- [ ] Zero dependências CSS extras?

---

## 🚫 O QUE NUNCA FAZER

```tsx
// ❌ NUNCA FAÇA ISSO:
import 'alguma-lib-css.css';
className="tailwind-class"
styled.div`css aqui`

// ✅ SEMPRE FAÇA ISSO:
style={{ backgroundColor: '#fff' }}
```

---

## 📦 PACKAGE.JSON IDEAL

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    // ZERO libs CSS
  }
}
```

---

**Última atualização:** 07/12/2025  
**Padrão obrigatório para todo o projeto Rota Verde**
