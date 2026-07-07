"use client";

import { motion } from "framer-motion";

const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493435173734";
const MESSAGE = encodeURIComponent(
  "Hola! Vi la web de Vision Equis y quiero consultar por un modelo de Ray-Ban."
);

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.658 4.523 1.8 6.383L4 29l7.81-1.756A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.75c-1.936 0-3.744-.55-5.28-1.5l-.378-.226-4.632 1.04 1.02-4.518-.246-.39A9.66 9.66 0 0 1 5.25 15c0-5.937 4.817-10.75 10.754-10.75S26.75 9.063 26.75 15 21.94 24.75 16.004 24.75zm5.53-7.98c-.303-.152-1.79-.883-2.068-.984-.278-.102-.48-.152-.683.152-.202.303-.784.984-.96 1.187-.177.202-.354.227-.657.076-.303-.152-1.28-.472-2.437-1.505-.9-.803-1.508-1.795-1.685-2.098-.177-.303-.02-.467.132-.618.136-.135.303-.354.454-.53.152-.177.202-.303.303-.505.101-.202.05-.38-.025-.53-.076-.152-.683-1.646-.936-2.253-.247-.593-.497-.513-.683-.522l-.582-.01c-.202 0-.53.076-.808.38-.278.303-1.06 1.036-1.06 2.53s1.085 2.936 1.236 3.139c.152.202 2.135 3.26 5.173 4.572.723.312 1.287.499 1.727.638.726.231 1.386.198 1.908.12.582-.087 1.79-.732 2.043-1.44.253-.708.253-1.314.177-1.44-.076-.127-.278-.202-.582-.354z" />
      </svg>
    </motion.a>
  );
}
