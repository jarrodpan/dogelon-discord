import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
	
	const time = Math.ceil((new Date()).getTime());
	
	res.send(
		
		{
			"code": "000000",
			"message": null,
			"messageDetail": null,
			"data": {
				"catalogs": [
					{
						"catalogId": 48,
						"parentCatalogId": null,
						"icon": "https://public.bnbstatic.com/image/cms/content/body/202202/9252ba30f961b1a20d49e622a0ecfad5.png",
						"catalogName": "Sample Response "+time.toString(),
						"description": null,
						"catalogType": 1,
						"total": 945,
						"articles": [
							{
            "id": 84989,
            "code": "2955fe7b406a43f3bdc4cdd0b226734f",
            "title": "Sample Response "+time.toString(),
            "type": 1,
            "releaseDate": (time - 100)
          },
						]
					}]
				}
		}
		
	);
});

app.listen(port, () => {
	// eslint-disable-next-line no-undef
	console.log(`listening on http://localhost:${port}`);
});