

module.exports = {
	id: 'contributions',

	handler: (router, ctx) => {
		const { ActivityService, ItemsService } = ctx.services
		const { ServiceUnavailableException, ForbiddenException } = ctx.exceptions
		
		router.get('/:userId', async (req, res, next) => {
			// We get all user activity on a document, find the actual documents, filter off activity on private docs, and then aggregate the result by date
			try {
				// Since we don't want users to access arbitrary activity, we user the service as admin here and control what the user sees manually
				const { userId } = req.params
				const activityService = new ActivityService({ schema: req.schema, accountability: { admin: true }})
				const activities = await activityService.readByQuery({
					fields: ['timestamp', 'item'],
					filter: {
						user: userId,
						collection: 'documents',
						action: {
							_in: ['create', 'update'],
						}
					},
					limit: -1
				})

				// Now that we have all activities with { timestamp, item }, we can get all individual document ids (the item key)

				// There are bound to be duplicate keys, so we create a set to squash the values to only unique IDs
				const affectedDocumentIds = new Set()
				// For every activity's affected item ID (document), we add it to the set
				for (const act of activities) {
					affectedDocumentIds.add(act.item)
				}
				// We then create a regular array from the unique document IDs, so we don't read same entries again when we get the documents
				const affectedDocumentsIdsArray = Array.from(affectedDocumentIds)

				// Now we get all the unique documents that were affected by the activities
				const itemsService = new ItemsService('documents', { schema: req.schema, accountability: { admin: true }})
				const docs = await itemsService.readMany(affectedDocumentsIdsArray)

				// These are the IDs of documents that have private: true (that we need to remove from activities)
				const publicDocIds = docs.filter(doc => !doc.private).map(doc => doc.id.toString()) // doc IDs are numbers, but for some reason activity.item is a string

				// These are the activites on items (docs) that are not private
				const publicActivities = activities.filter(act => publicDocIds.includes(act.item))
				// console.log('Num public activities: ', publicActivities.length)

				// Since timestamps are always in the ISOString-format (e.g. "2023-05-17T13:20:29.647Z"), we can just split on 'T' and keep the first part
				const publicActivitiesOnlyDate = publicActivities.map(act => act.timestamp.split('T')[0])

				// We can now count the number of activities on each date
				const activityCountByDate = publicActivitiesOnlyDate.reduce((acc, curr) => {
					acc[curr] = (acc[curr] || 0) + 1
					return acc
				}, {})

				// Convert the activityCountByDate object to an array of [ { date, count } ]
				const activityCountByDateArray = Object.entries(activityCountByDate).map(([date, count]) => ({ date, count }))

				return res.json(activityCountByDateArray)
			} catch (error) {
				console.error(error)

				return res.status(500).send(new ServiceUnavailableException(error.message || 'Something went wrong'))
			}
		})
	}
}



// export function getUserDocumentActivity(userId: string) {
// 	return query<Activity>('directus_activity', {
// 		// fields: ['timestamp'],
// 		filter: {
// 			user: userId,
// 			// collection: 'documents',
// 			// action: {
// 			// 	_in: ['create', 'update'],
// 			// },
// 		},
// 		limit: -1,
// 	})
// }