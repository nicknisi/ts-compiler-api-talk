export default function printTable(data: Map<string, number>, col1: string, col2: string): void {
	if (!data.size) return;

	// Calculating maximum cell width
	let keyMaxWidth = Math.max(...Array.from(data.keys()).map(key => key.length), col1.length);
	let valueMaxWidth = Math.max(...Array.from(data.values()).map(value => value.toString().length), col2.length);

	const headerKeys = col1.padEnd(keyMaxWidth);
	const headerValues = col2.padEnd(valueMaxWidth);

	// Printing header and separator line
	let output = `${headerKeys} | ${headerValues}\n`;
	output += `${'-'.repeat(keyMaxWidth)} | ${'-'.repeat(valueMaxWidth)}\n`;

	// Printing rows
	for (const [key, value] of Array.from(data).sort((a, b) => b[1] - a[1])) {
		const rowKey = key.padEnd(keyMaxWidth);
		const rowValue = value.toString().padEnd(valueMaxWidth);
		output += `${rowKey} | ${rowValue}\n`;
	}

	console.log(output);
}
