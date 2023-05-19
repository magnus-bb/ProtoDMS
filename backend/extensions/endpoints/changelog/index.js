module.exports = {
	id: 'changelog',

	handler: (router, ctx) => {

		// console.log(ctx)
		const { RevisionsService } = ctx.services
		const { ServiceUnavailableException, ForbiddenException } = ctx.exceptions
		
		router.get('/:documentId', async (req, res, next) => {

			try {
				const { documentId } = req.params

				/* Since we we only have one role for the platform, any role means that the user is authed.
				 Ideally we would pass a list of authed roles as env vars so we can check them specifically here.
				 The reason why we check auth like this instead of letting RevisionsService handle it by passing req.accountability
				 is because Directus does not allow us to set permissions that limit visibility of revisions to those that are on docs that are not private,
				 since "private" is in the "data" key of the revision, which is just JSON data, not an actual column in the SQL table. 
				 We cannot set permissions of activies based on the returned revisions either, which would result in users being able to see all users' activities
				 including those on private docs.
				 
				 The solution is to just check that the user is authed here, and then make the rest of the reads as an admin,
				 where we manually manage the exact data that the user gets (non-private, only activites on the requested doc) */
				if (!req.accountability.role) {
					return res.status(403).send(new ForbiddenException('You do not have access to this resource'))	
				}

				const revisionsService = new RevisionsService({ schema: req.schema, accountability: { role: 'admin', admin: true }})

				const allRevisionsForDoc = await revisionsService.readByQuery({
					filter: {
						collection: 'documents',
						item: documentId
					},
					fields: ['*', 'activity.timestamp', 'activity.user.first_name', 'activity.user.last_name', 'activity.user.avatar', 'activity.user.id'],
					limit: -1
				})

				/* 
				The only revisions we are interested in have
					- document 'content' to show (will be there after first content has been added, but in the beginning, the doc will only have a 'title' and a 'private' flag)
					- 'private' set to false (we don't want to show revisions on private docs)
					- a 'delta' in which the 'content' was changed (we don't want to show revisions where metadata such as relations, subscriptions etc were changed)
				*/ 
				const publicRevisionsWithContentChanges = allRevisionsForDoc.filter(revision => {
					return !revision.data?.private && revision.data?.content && revision.delta?.content
				})
				
				return res.json(publicRevisionsWithContentChanges)
			} catch (error) {
				return res.status(500).send(new ServiceUnavailableException(error.message || 'Something went wrong'))
			}
		})
	}
}