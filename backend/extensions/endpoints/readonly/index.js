module.exports = {
	id: 'readonly',

	handler: (router, ctx) => {

		const { SharesService, ItemsService } = ctx.services
		const { ServiceUnavailableException, ForbiddenException } = ctx.exceptions
		
		router.get('/:shareId', async (req, res, next) => {

			try {

				// Get information from the share that the user has the ID for
				const { shareId } = req.params
				const sharesService = new SharesService({ schema: req.schema, accountability: { admin: true }})
				const share = await sharesService.readOne(shareId)

				// If the share can expire, check that it has not
				if (share.date_end) {
					const now = new Date()
					const shareEnd = new Date(share.date_end)

					if (now > shareEnd) {
						return res.status(403).send(new ForbiddenException('This share has expired'))	
					}
				}

				// Get the shared item
				const itemsService = new ItemsService(share.collection, { schema: req.schema, accountability: { admin: true }})

				const item = await itemsService.readOne(share.item)

				return res.json(item)
			} catch (error) {
				console.error(error)

				return res.status(500).send(new ServiceUnavailableException(error.message || 'Something went wrong'))
			}
		})
	}
}