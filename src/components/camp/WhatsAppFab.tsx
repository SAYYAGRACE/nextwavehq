import { MessageCircle } from "lucide-react";
import { CAMP, whatsappLink } from "@/lib/camp";

/**
 * Floating WhatsApp button for the camp. Positioned bottom-right, stacked above
 * the BackToTop button (bottom-6 right-6) so the two never overlap.
 */
export function WhatsAppFab({ message = CAMP.chatPrefillText }: { message?: string }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with the Coding Camp on WhatsApp at ${CAMP.whatsapp.display}`}
      className="fixed bottom-20 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.55)] transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:right-6"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
    </a>
  );
}
