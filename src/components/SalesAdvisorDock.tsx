import { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { MEDIA_ASSETS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { buildWhatsAppUrl } from '../utils/salesAdvisor';
import { SalesAdvisorChat } from './SalesAdvisorChat';

export function SalesAdvisorDock() {
  const { settings } = useStore();
  const [open, setOpen] = useState(false);

  const floatingWaHref = useMemo(
    () =>
      buildWhatsAppUrl(
        settings.whatsappPhone,
        '¡Hola BEACH POLO! Estoy viendo su colección beachwear y quiero consultar por prendas, tallas o envíos en Perú.'
      ),
    [settings.whatsappPhone]
  );

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 max-w-[calc(100vw-2rem)]">
      {open && <SalesAdvisorChat onClose={() => setOpen(false)} />}

      <div className="flex items-center gap-2.5">
        <a
          href={floatingWaHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chatear por WhatsApp con BEACH POLO (+51 955871452)"
          title="WhatsApp directo +51 955871452"
          className="h-11 px-3.5 rounded-full bg-[#0F7B4D] hover:bg-[#0C653F] text-white shadow-lg border border-white/20 inline-flex items-center gap-2 text-xs font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B89B5E]"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={
            open
              ? 'Cerrar chat con Valeria, asesora BEACH POLO'
              : 'Hablar con Valeria, asesora virtual BEACH POLO'
          }
          className="h-12 pl-1.5 pr-3.5 rounded-full bg-[#082B3A] hover:bg-[#0E5A78] text-white shadow-xl border border-white/15 inline-flex items-center gap-2.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B89B5E]"
        >
          <span className="relative shrink-0">
            <img
              src={MEDIA_ASSETS.advisorAvatar}
              alt="Valeria · Asesora BEACH POLO"
              className="w-9 h-9 rounded-full object-cover object-top border border-[#E8D8BD]/70 bg-[#E8D8BD]"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#082B3A]"
            />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-xs font-display font-bold whitespace-nowrap">
              {open ? 'Cerrar chat' : 'Valeria · Asesora'}
            </span>
            <span className="hidden sm:block text-[10px] text-[#E8D8BD] whitespace-nowrap">
              {open ? 'BEACH POLO Perú' : 'Preguntas y compras'}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
