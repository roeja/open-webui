// Helper function to find matching closing tag
function findMatchingClosingTag(src, openTag, closeTag) {
	let depth = 1;
	let index = openTag.length;
	while (depth > 0 && index < src.length) {
		if (src.startsWith(openTag, index)) {
			depth++;
		} else if (src.startsWith(closeTag, index)) {
			depth--;
		}
		if (depth > 0) {
			index++;
		}
	}
	return depth === 0 ? index + closeTag.length : -1;
}

function detailsTokenizer(src) {
	const detailsRegex = /^<details>\n/;
	const summaryRegex = /^<summary>(.*?)<\/summary>\n/;

	if (detailsRegex.test(src)) {
		const endIndex = findMatchingClosingTag(src, '<details>', '</details>');
		if (endIndex === -1) return;

		const fullMatch = src.slice(0, endIndex);
		let content = fullMatch.slice(10, -10).trim(); // Remove <details> and </details>

		let summary = '';
		const summaryMatch = summaryRegex.exec(content);
		if (summaryMatch) {
			summary = summaryMatch[1].trim();
			content = content.slice(summaryMatch[0].length).trim();
		}

		return {
			type: 'details',
			raw: fullMatch,
			summary: summary,
			text: content
		};
	}
}

function detailsStart(src) {
	return src.match(/^<details>/) ? 0 : -1;
}

function detailsRenderer(token) {
	return `<details>
  ${token.summary ? `<summary>${token.summary}</summary>` : ''}
  ${token.text}
  </details>`;
}

function detailsExtension() {
	return {
		name: 'details',
		level: 'block',
		start: detailsStart,
		tokenizer: detailsTokenizer,
		renderer: detailsRenderer
	};
}

function thinkTokenizer(src) {
	const detailsRegex = /^<think>\n/;

	if (detailsRegex.test(src)) {
		const endIndex = findMatchingClosingTag(src, '<think>', '</think>');
		if (endIndex === -1) return;

		const fullMatch = src.slice(0, endIndex);
		let content = fullMatch.slice(8, -8).trim(); // Remove <think> and </think>

		return {
			type: 'think',
			raw: fullMatch,
			text: content
		};
	}
}

function thinkStart(src) {
	return src.match(/^<think>/) ? 0 : -1;
}

function thinkRenderer(token) {
	return `<details>
  ${token.text}
  </details>`;
}

function thinkExtension() {
	return {
		name: 'think',
		level: 'block',
		start: thinkStart,
		tokenizer: thinkTokenizer,
		renderer: thinkRenderer
	};
}

export default function (options = {}) {
	return {
		extensions: [
			detailsExtension(options),
			thinkExtension(options)
		]
	};
}
