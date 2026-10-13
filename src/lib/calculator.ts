/**
 * Motor de la calculadora de asados y del armado por presupuesto.
 * Funciones puras: reciben el catalogo y los parametros configurables, nunca precios fijos.
 */
import type { ClientProduct } from "@/lib/catalog";
import { estimatedWeight } from "@/lib/pricing";

export type CalculatorParams = {
  gramsPerAdult: number;
  childFactor: number;
  lightFactor: number;
  heavyFactor: number;
  achuraSharePercent: number;
  embutidoDiscountGrams: number;
  cutsUpTo4: number;
  cutsUpTo10: number;
  cutsOver10: number;
  minGramsPerPerson: number;
  suggestExtras: boolean;
};

export type Appetite = "poco" | "normal" | "abundante";
export type Level = "economico" | "clasico" | "premium";

export type CalculatorInput = {
  persons: number;
  children: number;
  appetite: Appetite;
  level: Level;
  includeAchuras: boolean;
  includeEmbutidos: boolean;
  /** Override de gramos por adulto (usado por el armado por presupuesto). */
  gramsPerAdultOverride?: number;
  /**
   * Piso de referencia: el combo armado para esa cantidad de personas. Con apetito normal o
   * abundante, la recomendacion nunca queda por debajo de su precio ni de su cantidad de carne.
   */
  floor?: ComboFloor;
};

export type ComboFloor = {
  /** Nombre del combo de referencia ("Combo Clásico 4 personas"). */
  label: string;
  /** Precio del combo para la cantidad de personas pedida. */
  price: number;
  /** Gramos de carne aproximados del combo para esa cantidad de personas. */
  grams: number;
  /** Personas para las que se calculo el combo. */
  persons: number;
};

export type PlanLine = {
  product: ClientProduct;
  quantity: number;
  targetGrams: number | null;
  estWeightMinG: number | null;
  estWeightMaxG: number | null;
  lineTotal: number;
  reason: string;
  optional: boolean;
};

export type Plan = {
  lines: PlanLine[];
  totalPrice: number;
  totalMeatGramsMin: number;
  totalMeatGramsMax: number;
  targetMeatGrams: number;
  eaters: number;
  estimated: boolean;
  notes: string[];
  /** Combo de referencia usado como piso y si hubo que subir la recomendacion para alcanzarlo. */
  reference: (ComboFloor & { applied: boolean; addedPortions: number }) | null;
};

const LEVEL_LABEL: Record<Level, string> = { economico: "económico", clasico: "clásico", premium: "premium" };
const TIER_LABEL: Record<ClientProduct["tier"], string> = { ECONOMICO: "económico", CLASICO: "clásico", PREMIUM: "premium" };

const TIER_ORDER: Record<Level, Array<ClientProduct["tier"]>> = {
  economico: ["ECONOMICO", "CLASICO"],
  clasico: ["CLASICO", "ECONOMICO", "PREMIUM"],
  premium: ["PREMIUM", "CLASICO"],
};

function pickByTier(products: ClientProduct[], level: Level, count: number) {
  const chosen: ClientProduct[] = [];
  for (const tier of TIER_ORDER[level]) {
    for (const p of products.filter((x) => x.tier === tier)) {
      if (chosen.length >= count) break;
      if (!chosen.includes(p)) chosen.push(p);
    }
    if (chosen.length >= count) break;
  }
  return chosen;
}

function portionsFor(product: ClientProduct, grams: number) {
  const ref = product.saleUnit === "PORTION" ? product.portionRefGrams : product.unitGrams;
  if (!ref) return Math.max(product.minQuantity, 1);
  return Math.max(product.minQuantity, Math.max(1, Math.round(grams / ref)));
}

function makeLine(product: ClientProduct, quantity: number, targetGrams: number | null, reason: string, optional = false): PlanLine {
  const w = estimatedWeight(product, quantity);
  return {
    product,
    quantity,
    targetGrams,
    estWeightMinG: w?.minG ?? null,
    estWeightMaxG: w?.maxG ?? null,
    lineTotal: product.unitPrice * quantity,
    reason,
    optional,
  };
}

export function buildPlan(products: ClientProduct[], params: CalculatorParams, input: CalculatorInput): Plan {
  const notes: string[] = [];
  const persons = Math.max(1, Math.floor(input.persons));
  const children = Math.min(persons, Math.max(0, Math.floor(input.children)));
  const adults = persons - children;
  const eaters = adults + children * params.childFactor;
  const factor = input.appetite === "poco" ? params.lightFactor : input.appetite === "abundante" ? params.heavyFactor : 1;
  const gramsPerAdult = input.gramsPerAdultOverride ?? params.gramsPerAdult;
  const targetMeatGrams = Math.round(eaters * gramsPerAdult * factor);

  const recommendable = products.filter((p) => p.minQuantity >= 1);
  const lines: PlanLine[] = [];
  let remaining = targetMeatGrams;

  // 1) Embutidos por unidad (chorizo, morcilla): descuentan carne del total.
  if (input.includeEmbutidos) {
    const embutidos = recommendable.filter((p) => p.role === "EMBUTIDO" && p.suggestedPerPerson);
    let units = 0;
    for (const p of embutidos) {
      const qty = Math.max(p.minQuantity, Math.ceil(persons * (p.suggestedPerPerson ?? 0)));
      if (qty <= 0) continue;
      units += qty;
      lines.push(makeLine(p, qty, null, `${p.suggestedPerPerson} por persona`));
    }
    const discount = Math.min(units * params.embutidoDiscountGrams, Math.round(targetMeatGrams * 0.4));
    remaining -= discount;
    if (discount > 0) notes.push(`Los embutidos descuentan ${discount} g de carne del total recomendado.`);
  }

  // 2) Achuras: porcentaje del total.
  if (input.includeAchuras) {
    const achuraGrams = Math.round((remaining * params.achuraSharePercent) / 100);
    const achuras = pickByTier(
      recommendable.filter((p) => p.role === "ACHURA"),
      input.level,
      persons > 6 ? 2 : 1
    );
    if (achuras.length) {
      const each = achuraGrams / achuras.length;
      for (const p of achuras) {
        lines.push(makeLine(p, portionsFor(p, each), Math.round(each), `${params.achuraSharePercent}% del total en achuras`));
      }
      remaining -= achuraGrams;
    }
  }

  // 3) Cortes principales: cantidad de cortes segun comensales.
  const cutsCount = persons <= 4 ? params.cutsUpTo4 : persons <= 10 ? params.cutsUpTo10 : params.cutsOver10;
  const cuts = pickByTier(recommendable.filter((p) => p.role === "CARNE"), input.level, Math.max(1, cutsCount));
  if (cuts.length === 0) {
    notes.push("No hay cortes disponibles para recomendar en este momento.");
  } else {
    const each = remaining / cuts.length;
    for (const p of cuts) {
      lines.push(makeLine(p, portionsFor(p, each), Math.round(each), `Corte ${TIER_LABEL[p.tier]} · ${Math.round(each)} g objetivo`));
    }
  }

  // 4) Extras sugeridos (provoleta, pan): opcionales.
  if (params.suggestExtras) {
    for (const p of recommendable.filter((x) => x.role === "EXTRA" && x.suggestedPerPerson)) {
      const qty = Math.ceil(persons * (p.suggestedPerPerson ?? 0));
      if (qty > 0) lines.push(makeLine(p, Math.max(p.minQuantity, qty), null, "Sugerido para acompañar", true));
    }
  }

  const isMeat = (l: PlanLine) => ["CARNE", "ACHURA", "EMBUTIDO"].includes(l.product.role) && !l.optional;
  const meatAvgGrams = () => lines.filter(isMeat).reduce((s, l) => s + ((l.estWeightMinG ?? 0) + (l.estWeightMaxG ?? 0)) / 2, 0);
  const priceOf = () => lines.filter((l) => !l.optional).reduce((s, l) => s + l.lineTotal, 0);

  // 5) Piso del combo: con apetito normal/abundante no se recomienda menos carne ni menos precio
  //    que el combo armado para esa cantidad de personas. Se suman porciones de los cortes
  //    principales (en ronda) hasta igualarlo o superarlo.
  let reference: Plan["reference"] = null;
  if (input.floor && input.appetite !== "poco") {
    const floor = input.floor;
    let added = 0;
    const mains = lines.filter((l) => l.product.role === "CARNE" && !l.optional);
    const targets = mains.length ? mains : lines.filter(isMeat);
    let i = 0;
    while (targets.length && (meatAvgGrams() < floor.grams || priceOf() < floor.price) && added < 60) {
      const line = targets[i % targets.length];
      const next = makeLine(line.product, line.quantity + 1, line.targetGrams, line.reason, line.optional);
      const idx = lines.indexOf(line);
      lines[idx] = next;
      targets[i % targets.length] = next;
      added += 1;
      i += 1;
    }
    if (added > 0) {
      for (const l of lines) {
        if (targets.includes(l)) l.reason = `${l.reason.split(" · ")[0]} · ajustado al piso del ${floor.label}`;
      }
      notes.push(
        `Se sumaron ${added} porción${added > 1 ? "es" : ""} para que la recomendación no quede por debajo del ${floor.label} (${floor.persons} personas).`
      );
    }
    reference = { ...floor, applied: added > 0, addedPortions: added };
  }

  const meatLines = lines.filter((l) => ["CARNE", "ACHURA", "EMBUTIDO"].includes(l.product.role));
  const totalMeatGramsMin = meatLines.reduce((s, l) => s + (l.estWeightMinG ?? 0), 0);
  const totalMeatGramsMax = meatLines.reduce((s, l) => s + (l.estWeightMaxG ?? 0), 0);
  const totalPrice = lines.reduce((s, l) => s + l.lineTotal, 0);

  if (children > 0) notes.push(`Los niños cuentan como ${Math.round(params.childFactor * 100)}% de una porción adulta.`);

  return {
    lines,
    totalPrice,
    totalMeatGramsMin,
    totalMeatGramsMax,
    targetMeatGrams,
    eaters,
    estimated: lines.some((l) => l.product.estimated),
    notes,
    reference,
  };
}

/* ---------------- Armado por presupuesto ---------------- */

export type BudgetPreference = "economico" | "equilibrado" | "premium";

export type BudgetInput = {
  budget: number;
  persons: number;
  preference: BudgetPreference;
  includeAccessories: boolean;
  /** Costo de envio a descontar del presupuesto (0 si no se conoce o es retiro). */
  deliveryFee: number;
};

export type BudgetResult = {
  ok: boolean;
  plan: Plan | null;
  level: Level | null;
  adjusted: boolean;
  accessories: PlanLine[];
  foodBudget: number;
  foodCost: number;
  accessoriesCost: number;
  deliveryFee: number;
  total: number;
  gramsPerPerson: number;
  warnings: string[];
  alternatives: string[];
};

const PREF_LEVELS: Record<BudgetPreference, Level[]> = {
  premium: ["premium", "clasico", "economico"],
  equilibrado: ["clasico", "economico"],
  economico: ["economico"],
};

export function buildBudgetPlan(products: ClientProduct[], params: CalculatorParams, input: BudgetInput): BudgetResult {
  const warnings: string[] = [];
  const alternatives: string[] = [];
  const persons = Math.max(1, Math.floor(input.persons));
  const budget = Math.max(0, Math.floor(input.budget));

  // Accesorios: la bolsa de carbon/lena mas barata disponible.
  const accessories: PlanLine[] = [];
  if (input.includeAccessories) {
    // Preferir bolsas (carbon/lena) antes que unidades sueltas (prendefacil); luego la mas barata.
    const fuel = products
      .filter((p) => p.role === "FUEGO" && p.unitPrice > 0)
      .sort((a, b) => Number(b.saleUnit === "PACKAGE") - Number(a.saleUnit === "PACKAGE") || a.unitPrice - b.unitPrice)[0];
    if (fuel) accessories.push(makeLine(fuel, fuel.minQuantity, null, "Para prender el fuego", true));
  }
  const accessoriesCost = accessories.reduce((s, l) => s + l.lineTotal, 0);
  const foodBudget = budget - input.deliveryFee - accessoriesCost;

  const base = (level: Level, achuras: boolean, override?: number, appetite: "normal" | "abundante" = "normal") =>
    buildPlan(products, params, {
      persons,
      children: 0,
      appetite,
      level,
      includeAchuras: achuras,
      includeEmbutidos: true,
      gramsPerAdultOverride: override,
    });

  const finish = (plan: Plan, level: Level, adjusted: boolean, ok: boolean): BudgetResult => {
    const foodCost = plan.lines.reduce((s, l) => s + l.lineTotal, 0);
    const meat = plan.lines.filter((l) => ["CARNE", "ACHURA", "EMBUTIDO"].includes(l.product.role));
    const avgGrams = meat.reduce((s, l) => s + ((l.estWeightMinG ?? 0) + (l.estWeightMaxG ?? 0)) / 2, 0);
    return {
      ok,
      plan,
      level,
      adjusted,
      accessories,
      foodBudget,
      foodCost,
      accessoriesCost,
      deliveryFee: input.deliveryFee,
      total: foodCost + accessoriesCost + input.deliveryFee,
      gramsPerPerson: Math.round(avgGrams / persons),
      warnings,
      alternatives,
    };
  };

  if (foodBudget <= 0) {
    warnings.push("El presupuesto no alcanza ni para cubrir envío y accesorios.");
    return {
      ok: false, plan: null, level: null, adjusted: false, accessories, foodBudget, foodCost: 0,
      accessoriesCost, deliveryFee: input.deliveryFee, total: 0, gramsPerPerson: 0, warnings, alternatives,
    };
  }

  // 1) Intentar el plan completo bajando de nivel y luego sin achuras.
  for (const level of PREF_LEVELS[input.preference]) {
    for (const achuras of [true, false]) {
      let plan = base(level, achuras);
      if (plan.lines.length && plan.totalPrice <= foodBudget) {
        if (level !== PREF_LEVELS[input.preference][0]) {
          warnings.push(`Para entrar en el presupuesto se eligieron cortes de nivel ${LEVEL_LABEL[level]}.`);
        }
        if (!achuras) warnings.push("Se dejaron las achuras afuera para entrar en el presupuesto.");
        // Si sobra presupuesto, se aprovecha con porciones abundantes del mismo nivel.
        const generous = base(level, achuras, undefined, "abundante");
        if (generous.lines.length && generous.totalPrice <= foodBudget && generous.totalPrice > plan.totalPrice) {
          plan = generous;
          warnings.push("Sobraba presupuesto: se aumentaron las cantidades a porciones abundantes.");
        }
        return finish(plan, level, level !== PREF_LEVELS[input.preference][0] || !achuras, true);
      }
    }
  }

  // 2) Ajustar la cantidad de carne por persona en el nivel mas economico permitido.
  const cheapestLevel = PREF_LEVELS[input.preference][PREF_LEVELS[input.preference].length - 1];
  const reference = base(cheapestLevel, false);
  if (!reference.lines.length) {
    warnings.push("No hay productos disponibles para armar una propuesta.");
    return finish(reference, cheapestLevel, true, false);
  }
  const ratio = foodBudget / reference.totalPrice; // < 1
  const gramsPerAdult = Math.floor(params.gramsPerAdult * ratio);

  if (gramsPerAdult >= params.minGramsPerPerson) {
    const plan = base(cheapestLevel, false, gramsPerAdult);
    if (plan.totalPrice <= foodBudget) {
      warnings.push(
        `Se redujo la cantidad a aproximadamente ${gramsPerAdult} g de carne por persona (recomendado: ${params.gramsPerAdult} g).`
      );
      return finish(plan, cheapestLevel, true, true);
    }
  }

  // 3) No alcanza: advertir y ofrecer alternativas concretas.
  const minPlan = base(cheapestLevel, false, params.minGramsPerPerson);
  const needed = minPlan.totalPrice + accessoriesCost + input.deliveryFee;
  const perPersonCost = minPlan.totalPrice / persons;
  const affordablePersons = Math.floor(foodBudget / Math.max(1, perPersonCost));
  warnings.push(
    `Con este presupuesto no se llega al mínimo recomendado de ${params.minGramsPerPerson} g de carne por persona para ${persons} comensales.`
  );
  alternatives.push(`Ampliar el presupuesto a aproximadamente $${needed.toLocaleString("es-AR")} para ${persons} personas.`);
  if (affordablePersons >= 1 && affordablePersons < persons) {
    alternatives.push(`Con $${budget.toLocaleString("es-AR")} se puede armar un asado mínimo para ${affordablePersons} persona${affordablePersons > 1 ? "s" : ""}.`);
  }
  if (input.includeAccessories && accessoriesCost > 0) alternatives.push("Quitar los accesorios de la propuesta.");
  if (input.deliveryFee > 0) alternatives.push("Elegir retiro por local para no pagar envío.");
  return finish(minPlan, cheapestLevel, true, false);
}
