import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPD | Simulador de Penalidades DESO',
  description:
    'Sistema de Simulação e Gestão de Penalidades Contratuais da DESO — AGRESE, Equação D, Contrato de Produção de Água e Contrato de Interdependência.',
  keywords: ['DESO', 'AGRESE', 'MAES', 'penalidades', 'compliance', 'saneamento', 'Sergipe'],
};

import { SettingsProvider } from '@/context/SettingsContext';
import { EstimateProvider } from '@/context/EstimateContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SettingsProvider>
          <EstimateProvider>
            {children}
          </EstimateProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
