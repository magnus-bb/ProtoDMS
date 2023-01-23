export const TIME_UNITS: Record<string, number> = {
	year: 24 * 60 * 60 * 1000 * 365,
	month: (24 * 60 * 60 * 1000 * 365) / 12,
	day: 24 * 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
	minute: 60 * 1000,
	second: 1000,
}

export function dateStringToRelativeTimestamp(
	dateString?: string | null,
	relativeTo: number = Date.now()
): string {
	if (!dateString) return ''

	const date = Date.parse(dateString)

	return dateToRelativeTimestamp(date, relativeTo)
}

export function dateToRelativeTimestamp(
	date?: number | null,
	relativeTo: number = Date.now()
): string {
	if (!date) return ''

	const rtf = new Intl.RelativeTimeFormat()

	const elapsed = date - relativeTo

	if (elapsed < 5000) return 'just now'

	// "Math.abs" accounts for both "past" & "future" scenarios
	for (const unit in TIME_UNITS) {
		if (Math.abs(elapsed) > TIME_UNITS[unit] || unit === 'second') {
			return rtf.format(Math.round(elapsed / TIME_UNITS[unit]), unit as Intl.RelativeTimeFormatUnit)
		}
	}

	return ''
}
