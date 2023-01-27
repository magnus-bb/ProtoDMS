const VALUE_MAP: Record<string, unknown> = {
	true: true,
	false: false,
	null: null,
	undefined,
}

// Cast return values as T, since we want to either return unknown OR the type, that the user knows will be returned
export function parseString<T = unknown>(value = ''): T {
	if (value in VALUE_MAP) {
		return VALUE_MAP[value] as T
	}

	// This will only be true if the value is a number
	// @ts-ignore-next-line - This is a valid check for whether a string can be parsed as a number, ts is plain wrong
	if (!isNaN(value)) {
		// If the value is a number, parse it as a number
		return Number(value) as T
	}

	// Otherwise, just return the string value as-is
	return value as T
}

// Passing a url query can either be a string (single value) or an array of strings when coming from route.query
export function parseArray<T = unknown>(val: string[] | string): T[] {
	// If the val is a string, just return it in an array cast as T
	if (typeof val === 'string') {
		return [parseString<T>(val)]
	}

	// If the val is an array, parse every element inside
	return val.map(parseString<T>)
}
