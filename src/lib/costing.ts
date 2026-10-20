// Costeo de productos. Tres bloques: materiales (receta x ultimo precio),
// mano de obra (minutos x valor hora) y gastos generales (fijos del mes
// repartidos por unidad). Se usa tanto en el servidor como en el panel.

export type CostSettingsInput = {
  ownerMonthlySalary: number;
  employeeDailyRate: number;
  employeeDaysPerWeek: number;
  productiveHoursPerMonth: number;
  fixedMonthlyCosts: number;
  estimatedMonthlyUnits: number;
  wholesaleMarginPercent: number;
  retailMultiplier: number;
  mpFeePercent: number;
};

export type RecipeLine = {
  quantity: number;
  material: { unitCost: number };
};

export type ProductCostInput = {
  laborMinutes: number;
  materials: RecipeLine[];
};

export type CostBreakdown = {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  hourlyRate: number;
  suggestedWholesale: number;
  suggestedRetail: number;
};

const WEEKS_PER_MONTH = 4.33;

export function roundToHundred(value: number) {
  return Math.max(0, Math.round(value / 100) * 100);
}

// Valor de la hora del taller: lo que quiere ganar la duena + la empleada,
// dividido por las horas productivas del mes.
export function hourlyRate(s: CostSettingsInput) {
  const employeeMonthly = s.employeeDailyRate * s.employeeDaysPerWeek * WEEKS_PER_MONTH;
  const hours = s.productiveHoursPerMonth > 0 ? s.productiveHoursPerMonth : 1;
  return (s.ownerMonthlySalary + employeeMonthly) / hours;
}

export function overheadPerUnit(s: CostSettingsInput) {
  const units = s.estimatedMonthlyUnits > 0 ? s.estimatedMonthlyUnits : 1;
  return s.fixedMonthlyCosts / units;
}

export function computeCost(product: ProductCostInput, s: CostSettingsInput): CostBreakdown {
  const rate = hourlyRate(s);
  const materialCost = product.materials.reduce(
    (sum, line) => sum + line.quantity * line.material.unitCost,
    0
  );
  const laborCost = (product.laborMinutes / 60) * rate;
  const overheadCost = overheadPerUnit(s);
  const totalCost = materialCost + laborCost + overheadCost;
  const suggestedWholesale = roundToHundred(totalCost * (1 + s.wholesaleMarginPercent / 100));
  const suggestedRetail = roundToHundred(suggestedWholesale * s.retailMultiplier);

  return {
    materialCost: Math.round(materialCost),
    laborCost: Math.round(laborCost),
    overheadCost: Math.round(overheadCost),
    totalCost: Math.round(totalCost),
    hourlyRate: Math.round(rate),
    suggestedWholesale,
    suggestedRetail,
  };
}

// Margen real de un precio de venta sobre el costo total (en %). Negativo si
// se vende por debajo del costo.
export function marginPercent(price: number, totalCost: number) {
  if (price <= 0) return 0;
  return Math.round(((price - totalCost) / price) * 100);
}

// Lo que queda despues de la comision de Mercado Pago.
export function netAfterMp(price: number, s: CostSettingsInput) {
  return Math.round(price * (1 - s.mpFeePercent / 100));
}

// Un producto sin receta ni minutos cargados no tiene costo confiable.
export function hasCostData(product: ProductCostInput) {
  return product.laborMinutes > 0 || product.materials.length > 0;
}
