export default function removeEmpty(obj: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(Object.entries(obj).filter(([_, val]) => !valIsEmpty(val)))
}

function valIsEmpty(val: unknown) {
	if (Array.isArray(val)) {
		return val.length === 0
	}

	return val === undefined || val === '' || val === null
}
