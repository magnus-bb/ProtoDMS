module.exports = ({ action }, ctx) => {
	const { ItemsService } = ctx.services

	action('items.create', setPlaintextContent)
	action('items.update', setPlaintextContent)


	async function setPlaintextContent({ payload, keys, collection }, { schema, accountability }) {
		// We are only interested in setting content_plaintext on documents, obviously
		if (collection !== 'documents') return console.warn('Not a document, skipping plaintext content update')
		if (!payload.content?.ops) return console.warn('No content.ops, skipping plaintext content update')
	
		try {

			const itemsService = new ItemsService(collection, { schema, accountability })
			
			const plaintext = toPlaintext(payload.content.ops)

			// Only one update if this happens through the frontend, but technically could be multiple documents
			await itemsService.updateMany(keys, { content_plaintext: plaintext })
			
		} catch (error) {
			console.error(`Something went wrong updating the plaintext content of document(s) ${keys}. This might impact searching in document contents `, error)
		}
	}
}


/*
ISC License

Copyright https://github.com/purposeindustries/quill-delta-to-plaintext

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
function toPlaintext(delta) {
	// Kind of hacky, but if we remove all non-insert operations (such as retain),
	// it should have no effect on the actual plaintext content in the end,
	// as long as there are no 'delete' operations (which there shouldn't be)
	delta.filter(op => op.insert)

  return delta.reduce(function (text, op) {
    // if (!op.insert) throw new TypeError('only `insert` operations can be transformed!')
    if (typeof op.insert !== 'string') return text + ' '
    return text + op.insert
  }, '')
}