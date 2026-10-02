import { PricingRule, CalculationResult, Company, LensType, OrderedEye } from '../types';

export function parseDiopter(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  const cleanStr = val.toString().trim().replace(',', '.');
  if (cleanStr === '' || cleanStr === '+' || cleanStr === '-') return 0;
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

export function formatDiopter(val: number): string {
  const rounded = Math.round(val * 100) / 100;
  const formatted = Math.abs(rounded).toFixed(2);
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return '0.00';
}

export function formatRange(min: number, max: number): string {
  return `${min.toFixed(2)} - ${max.toFixed(2)}`;
}

export function calculateLensPrice(
  companyId: string,
  lensTypeId: string,
  orderedEye: OrderedEye,
  rightSph: string | number,
  rightCyl: string | number,
  leftSph: string | number,
  leftCyl: string | number,
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

  // Parse diopter inputs
  const parsedRSph = parseDiopter(rightSph);
  const parsedRCyl = parseDiopter(rightCyl);
  const parsedLSph = parseDiopter(leftSph);
  const parsedLCyl = parseDiopter(leftCyl);

  const absRSph = Math.abs(parsedRSph);
  const absRCyl = Math.abs(parsedRCyl);
  const absLSph = Math.abs(parsedLSph);
  const absLCyl = Math.abs(parsedLCyl);

  // Calculate the maximum absolute value based on orderedEye
  let rawMax = 0;
  if (orderedEye === 'right') {
    rawMax = Math.max(absRSph, absRCyl);
  } else if (orderedEye === 'left') {
    rawMax = Math.max(absLSph, absLCyl);
  } else {
    rawMax = Math.max(absRSph, absRCyl, absLSph, absLCyl);
  }

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
        rightSph: orderedEye !== 'left' ? parsedRSph : undefined,
        rightCyl: orderedEye !== 'left' ? parsedRCyl : undefined,
        leftSph: orderedEye !== 'right' ? parsedLSph : undefined,
        leftCyl: orderedEye !== 'right' ? parsedLCyl : undefined,
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
        rightSph: orderedEye !== 'left' ? parsedRSph : undefined,
        rightCyl: orderedEye !== 'left' ? parsedRCyl : undefined,
        leftSph: orderedEye !== 'right' ? parsedLSph : undefined,
        leftCyl: orderedEye !== 'right' ? parsedLCyl : undefined,
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
      rightSph: orderedEye !== 'left' ? parsedRSph : undefined,
      rightCyl: orderedEye !== 'left' ? parsedRCyl : undefined,
      leftSph: orderedEye !== 'right' ? parsedLSph : undefined,
      leftCyl: orderedEye !== 'right' ? parsedLCyl : undefined,
      maxAbsValue,
      appliedRange: formatRange(min, max),
    },
  };
}
