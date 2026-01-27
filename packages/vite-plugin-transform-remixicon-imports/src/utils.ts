/**
 * Normalizes a PascalCase name to a kebab-case name.
 *
 * @example
 * ```ts
 * normalizeName("RiAddFill") // "add-fill"
 * normalizeName("RiAccountBoxFill") // "account-box-fill"
 * normalizeName("Ri24HoursFill") // "24-hours-fill"
 * normalizeName("RiAB") // "a-b"
 * ```
 *
 * @param name
 * @returns
 */
export function normalizeName(name: string) {
	let trimmedName = name;

	// Remove "Ri" prefix
	if (name.startsWith('Ri')) {
		trimmedName = trimmedName.slice(2);
	}

	return pascalToKebab(trimmedName);
}

function pascalToKebab(str: string): string {
	let newStr = '';

	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		const prevChar = i > 0 ? str[i - 1] : null;
		const nextChar = i < str.length - 1 ? str[i + 1] : null;

		if (i > 0) {
			// Add hyphen before uppercase letter if:
			// - previous char was lowercase, OR
			// - previous char was uppercase (handles "AB" -> "a-b" and "XMLHttp" -> "x-m-l-http")
			if (
				isLetter(char) &&
				char.toUpperCase() === char &&
				isLetter(prevChar!) &&
				(prevChar!.toLowerCase() === prevChar! || prevChar!.toUpperCase() === prevChar!)
			) {
				newStr += '-';
			}
			// Add hyphen before number if previous char was a letter
			else if (!isLetter(char) && isLetter(prevChar!)) {
				newStr += '-';
			}
		}

		// Add hyphen after number only if next char is an uppercase letter
		if (!isLetter(char) && nextChar && isLetter(nextChar) && nextChar.toUpperCase() === nextChar) {
			newStr += char.toLocaleLowerCase() + '-';
			continue;
		}

		newStr += char.toLocaleLowerCase();
	}

	return newStr;
}

const LETTER_REGEX = new RegExp(/[a-zA-Z]/);

function isLetter(char: string): boolean {
	if (char.length > 1) {
		throw new Error(
			`You probably only meant to pass a character to this function. Instead you gave ${char}`
		);
	}

	return LETTER_REGEX.test(char);
}
