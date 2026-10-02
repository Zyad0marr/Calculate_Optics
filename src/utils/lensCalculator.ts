import { PricingRule, CalculationResult, Company, LensType, OrderedEye } from '../types';

/**
 * Parses diopter input.
 * Returns null if the value is empty, undefined, null, or whitespace.
 * Never converts empty inputs to 0.
 */
export function parseOptionalDiopter(val: string | number | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  const cleanStr = val.toString().trim().replace(',', '.');
  if (cleanStr === '' || cleanStr === '+' || cleanStr === '-') return null;
  const num = parseFloat(cleanStr);
  return isNaN(num) ? null : num;
}

/**
 * Backward compatibility parser when a numeric fallback is needed.
 */
export function parseDiopter(val: string | number | undefined | null): number {
  return parseOptionalDiopter(val) ?? 0;
}

/**
 * Formats a number to optical diopter notation (+1.50, -1.50).
 */
export function formatDiopter(val: number): string {
  const rounded = Math.round(val * 100) / 100;
  const formatted = Math.abs(rounded).toFixed(2);
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return '0.00';
}

/**
 * Formats an optional diopter value for display.
 * If empty/null, returns empty string.
 */
export function formatOptionalDiopter(val: number | null | undefined): string {
  if (val === null || val === undefined) return '';
  return formatDiopter(val);
}

export function formatRange(min: number, max: number): string {
  return `${min.toFixed(2)} - ${max.toFixed(2)}`;
}

export function calculateLensPrice(
  companyId: string,
  lensTypeId: string,
  orderedEye: OrderedEye,
  rightSph: string | number | null | undefined,
  rightCyl: string | number | null | undefined,
  leftSph: string | number | null | undefined,
  leftCyl: string | number | null | undefined,
  rules: PricingRule[],
  companies: Company[],
  lensTypes: LensType[]
): CalculationResult {
  const company = companies.find((c) => c.id === companyId);
  const lensType = lensTypes.find((lt) => lt.id === lensTypeId);

  const companyName = company ? company.name : 'غير محدد';
  const lensTypeName = lensType ? lensType.name : 'غير محدد';

  if (!companyId || !lensTypeId) {
    return {
      found: false,
      price: null,
      maxAbsValue: 0,
      matchedRule: null,
      companyName,
      lensTypeName,
      orderedEye,
      message: 'يرجى اختيار الشركة ونوع العدسة',
    };
  }

  // Parse diopter inputs strictly as optional numbers (null if empty)
  const parsedRSph = parseOptionalDiopter(rightSph);
  const parsedRCyl = parseOptionalDiopter(rightCyl);
  const parsedLSph = parseOptionalDiopter(leftSph);
  const parsedLCyl = parseOptionalDiopter(leftCyl);

  // Collect ONLY the values that were actually entered by the user
  const enteredAbsValues: number[] = [];

  if (orderedEye !== 'left') {
    if (parsedRSph !== null) enteredAbsValues.push(Math.abs(parsedRSph));
    if (parsedRCyl !== null) enteredAbsValues.push(Math.abs(parsedRCyl));
  }

  if (orderedEye !== 'right') {
    if (parsedLSph !== null) enteredAbsValues.push(Math.abs(parsedLSph));
    if (parsedLCyl !== null) enteredAbsValues.push(Math.abs(parsedLCyl));
  }

  // If no prescription values were entered at all:
  if (enteredAbsValues.length === 0) {
    return {
      found: false,
      price: null,
      maxAbsValue: 0,
      matchedRule: null,
      companyName,
      lensTypeName,
      orderedEye,
      message: 'يرجى إدخال المقاس المطلوب (SPH أو CYL)',
      calculationDetails: {
        rightSph: orderedEye !== 'left' ? parsedRSph : null,
        rightCyl: orderedEye !== 'left' ? parsedRCyl : null,
        leftSph: orderedEye !== 'right' ? parsedLSph : null,
        leftCyl: orderedEye !== 'right' ? parsedLCyl : null,
        maxAbsValue: 0,
        appliedRange: 'غير محدد',
      },
    };
  }

  // Calculate the maximum absolute value strictly from entered values
  // Example: SPH = -1.50, CYL = empty -> max is ABS(-1.50) = 1.50
  const rawMax = Math.max(...enteredAbsValues);
  const maxAbsValue = Math.round(rawMax * 100) / 100;

  // Filter pricing rules for this specific Company and Lens Type
  const targetRules = rules.filter((r) => {
    const cId = r.company_id || r.companyId;
    const ltId = r.lens_type_id || r.lensTypeId;
    return cId === companyId && ltId === lensTypeId;
  });

  if (targetRules.length === 0) {
    return {
      found: false,
      price: null,
      maxAbsValue,
      matchedRule: null,
      companyName,
      lensTypeName,
      orderedEye,
      message: `لا توجد قواعد تسعير مسجلة لشركة "${companyName}" ونوع "${lensTypeName}"`,
      calculationDetails: {
        rightSph: orderedEye !== 'left' ? parsedRSph : null,
        rightCyl: orderedEye !== 'left' ? parsedRCyl : null,
        leftSph: orderedEye !== 'right' ? parsedLSph : null,
        leftCyl: orderedEye !== 'right' ? parsedLCyl : null,
        maxAbsValue,
        appliedRange: 'غير متوفر',
      },
    };
  }

  const EPSILON = 0.0001;
  const matched = targetRules.find((r) => {
    const min = r.min_range !== undefined ? r.min_range : r.minRange;
    const max = r.max_range !== undefined ? r.max_range : r.maxRange;
    return maxAbsValue >= min - EPSILON && maxAbsValue <= max + EPSILON;
  });

  if (!matched) {
    return {
      found: false,
      price: null,
      maxAbsValue,
      matchedRule: null,
      companyName,
      lensTypeName,
      orderedEye,
      message: `لا يوجد نطاق تسعير يشمل المقاس ${maxAbsValue.toFixed(2)} لهذه العدسة`,
      calculationDetails: {
        rightSph: orderedEye !== 'left' ? parsedRSph : null,
        rightCyl: orderedEye !== 'left' ? parsedRCyl : null,
        leftSph: orderedEye !== 'right' ? parsedLSph : null,
        leftCyl: orderedEye !== 'right' ? parsedLCyl : null,
        maxAbsValue,
        appliedRange: 'خارج النطاق',
      },
    };
  }

  const min = matched.min_range !== undefined ? matched.min_range : matched.minRange;
  const max = matched.max_range !== undefined ? matched.max_range : matched.maxRange;

  return {
    found: true,
    price: matched.price,
    maxAbsValue,
    matchedRule: matched,
    companyName,
    lensTypeName,
    orderedEye,
    calculationDetails: {
      rightSph: orderedEye !== 'left' ? parsedRSph : null,
      rightCyl: orderedEye !== 'left' ? parsedRCyl : null,
      leftSph: orderedEye !== 'right' ? parsedLSph : null,
      leftCyl: orderedEye !== 'right' ? parsedLCyl : null,
      maxAbsValue,
      appliedRange: formatRange(min, max),
    },
  };
}
