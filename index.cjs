@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: "JetBrains Mono", monospace;
  --font-display: "Orbitron", sans-serif;
  
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
}

:root {
  --background: 0 0% 0%;
  --foreground: 152 100% 80%;
  --card: 0 0% 3%;
  --card-foreground: 152 100% 80%;
  --popover: 0 0% 3%;
  --popover-foreground: 152 100% 80%;
  --primary: 152 100% 50%;
  --primary-foreground: 0 0% 0%;
  --secondary: 0 0% 10%;
  --secondary-foreground: 152 100% 50%;
  --muted: 0 0% 10%;
  --muted-foreground: 152 50% 50%;
  --accent: 152 100% 50%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 100% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 152 100% 20%;
  --input: 152 100% 20%;
  --ring: 152 100% 50%;
  --radius: 0.25rem;
}

.dark {
  --background: 0 0% 0%;
  --foreground: 152 100% 80%;
  --card: 0 0% 3%;
  --card-foreground: 152 100% 80%;
  --popover: 0 0% 3%;
  --popover-foreground: 152 100% 80%;
  --primary: 152 100% 50%;
  --primary-foreground: 0 0% 0%;
  --secondary: 0 0% 10%;
  --secondary-foreground: 152 100% 50%;
  --muted: 0 0% 10%;
  --muted-foreground: 152 50% 50%;
  --accent: 152 100% 50%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 100% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 152 100% 20%;
  --input: 152 100% 20%;
  --ring: 152 100% 50%;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply font-sans antialiased bg-background text-foreground;
    background-image: 
      radial-gradient(circle at 50% 0%, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
      linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
    background-size: 100% 100%, 20px 20px, 20px 20px;
    background-position: 0 0, 0 0, 0 0;
  }
}

/* Custom Scrollbar for the Matrix vibe */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: hsl(var(--background));
}
::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
}
::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary));
}
