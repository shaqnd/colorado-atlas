import { lookupCountyByCity, primaryCounty } from '@/data/cityCountyLookup';
import { countiesByName } from '@/data/counties';
import type { County, GeocoderResult } from '@/data/types';

export interface AddressResolution {
  rawInput: string;
  extractedCity: string | null;
  county: string | null;
  counties: string[] | null;  // populated when multi-county city
  countyData: County | null;
  geocoderResult: GeocoderResult | null;
  resolvedVia: 'geocoder' | 'lookup' | 'none';
  warning?: string;
}

/**
 * Extract the city component from a freeform address string.
 * Handles most standard US address formats.
 */
export function extractCity(address: string): string | null {
  const cleaned = address.trim();

  // Try to match: "123 Main St, Boulder, CO 80302" or "123 Main St Boulder CO 80302"
  // City is typically after the last comma before state abbreviation
  const withCommas = cleaned.match(/,\s*([^,]+?)\s*,?\s*CO\b/i);
  if (withCommas) return withCommas[1].trim();

  // Try: "...City CO XXXXX" (no comma before CO)
  const noComma = cleaned.match(/\b([A-Za-z\s]+?)\s+CO\s+\d{5}/i);
  if (noComma) {
    const candidate = noComma[1].trim();
    // Filter out obvious street suffixes
    const streetSuffixes = /\b(st|ave|blvd|dr|rd|way|ln|ct|pl|cir|hwy|pkwy|trail|loop)\b/i;
    if (!streetSuffixes.test(candidate)) return candidate;
  }

  // Last resort: take last word before "Colorado" or "CO"
  const stateMatch = cleaned.match(/([A-Za-z\s]+?),?\s*(Colorado|CO)\b/i);
  if (stateMatch) {
    const words = stateMatch[1].trim().split(/\s+/);
    return words[words.length - 1] || null;
  }

  return null;
}

/**
 * Resolve an address string to county data using:
 * 1. Census Bureau geocoder (via server proxy) — best accuracy
 * 2. City-to-county lookup table — fast fallback
 */
export async function resolveAddress(rawAddress: string): Promise<AddressResolution> {
  const base: AddressResolution = {
    rawInput: rawAddress,
    extractedCity: null,
    county: null,
    counties: null,
    countyData: null,
    geocoderResult: null,
    resolvedVia: 'none',
  };

  // Step 1: Try Census Bureau geocoder
  try {
    const params = new URLSearchParams({ address: rawAddress });
    const res = await fetch(`/api/geocode?${params.toString()}`);
    if (res.ok) {
      const data: GeocoderResult = await res.json();
      if (data.countyName) {
        const normalizedName = normalizeCountyName(data.countyName);
        return {
          ...base,
          extractedCity: null,
          county: normalizedName,
          counties: null,
          countyData: countiesByName[normalizedName.toLowerCase()] ?? null,
          geocoderResult: data,
          resolvedVia: 'geocoder',
        };
      }
    }
  } catch {
    // Server not running or network error — fall through to lookup
  }

  // Step 2: City-to-county lookup
  const city = extractCity(rawAddress);
  base.extractedCity = city;

  if (city) {
    const lookup = lookupCountyByCity(city);
    if (lookup) {
      const primary = Array.isArray(lookup) ? lookup[0] : lookup;
      const multiCounty = Array.isArray(lookup) ? lookup : null;
      const countyData = countiesByName[primary.toLowerCase()] ?? null;

      const result: AddressResolution = {
        ...base,
        county: primary,
        counties: multiCounty,
        countyData,
        resolvedVia: 'lookup',
      };

      if (multiCounty) {
        result.warning = `${city} spans ${multiCounty.join(', ')} counties. Showing data for ${primary}.`;
      }

      return result;
    }
  }

  return { ...base, resolvedVia: 'none' };
}

/**
 * Normalize county names from Census Bureau format.
 * Census returns "Boulder County" — we want "Boulder".
 */
function normalizeCountyName(raw: string): string {
  return raw
    .replace(/\s+County$/i, '')
    .replace(/\s+Parish$/i, '')
    .trim();
}

/**
 * Quick synchronous lookup (no geocoder, lookup only).
 */
export function quickLookup(rawAddress: string): {
  city: string | null;
  county: string | null;
  countyData: County | null;
} {
  const city = extractCity(rawAddress);
  if (!city) return { city: null, county: null, countyData: null };
  const county = primaryCounty(city) ?? null;
  const countyData = county ? (countiesByName[county.toLowerCase()] ?? null) : null;
  return { city, county, countyData };
}
