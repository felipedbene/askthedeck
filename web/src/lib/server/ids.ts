/**
 * ID generation for D1-backed entities. All base36 for compactness.
 */

function randomBase36(length: number): string {
	// crypto.getRandomValues is available in Workers.
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	// Map each byte to a base36 digit. Discards a little entropy per byte (8
	// bits → log2(36) ≈ 5.17), but length-controlled output matters more than
	// raw entropy here. For 8 chars that's ~41 bits, plenty for share slugs.
	const ALPHA = '0123456789abcdefghijklmnopqrstuvwxyz';
	let out = '';
	for (let i = 0; i < length; i++) {
		out += ALPHA[bytes[i] % 36];
	}
	return out;
}

export function generateReaderId(): string {
	return `rdr_${randomBase36(16)}`;
}

export function generateReadingId(): string {
	const ts = Date.now().toString(36);
	return `rdg_${ts}_${randomBase36(6)}`;
}

export function generateShareSlug(): string {
	return randomBase36(8);
}
