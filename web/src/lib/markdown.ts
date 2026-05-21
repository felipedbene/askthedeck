/**
 * Minimal markdown renderer ported from the vanilla app.
 * Handles a focused subset suitable for DeepSeek's reading output:
 * bold, italic, h1–h4, hr, list items, and line breaks.
 *
 * The input is HTML-escaped before any transformations so any incidental
 * HTML/script in the model output stays inert.
 */
export function renderMarkdown(src: string): string {
	const escaped = src
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	return escaped
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/^# (.*)$/gm, '<h1>$1</h1>')
		.replace(/^## (.*)$/gm, '<h2>$1</h2>')
		.replace(/^### (.*)$/gm, '<h3>$1</h3>')
		.replace(/^#### (.*)$/gm, '<h4>$1</h4>')
		.replace(/^---$/gm, '<hr>')
		.replace(/^\*\*\*$/gm, '<hr>')
		.replace(/^- (.*)$/gm, '<li>$1</li>')
		.replace(/^\* (.*)$/gm, '<li>$1</li>')
		.replace(/\n/g, '<br>');
}
