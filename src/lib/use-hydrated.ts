"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true solo despues de hidratar en el cliente (evita desajustes con el carrito persistido). */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
