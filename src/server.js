const express = require('express');
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const data = require("./data.json");
const streets = require("./streets.json");
const port = 3001;
//TOREMOVE

app.use(cors());
app.get('/', (req, res) => {
	res.send('Hello World!');
	console.log("hola mundo");
});
app.get("/getStore/:id", (req, res) => {
	let place = data.filter(place => place.place_id == req.params.id);
	res.send(place ? place[0] : {})
})
app.get("/getStores/:lat/:lon/:category", (req, res) => {
	try {
		// let data = await fetch("https://spotashop.herokuapp.com/get_ids");
		let coords = data.filter(place => place.type === req.params.category).map(place => {
			return {...place, "distance": Math.pow(place.lat - req.params.lat, 2) + Math.pow(place.lng - req.params.lon, 2)};
		});
		res.send(coords.sort((a, b) => a.distance - b.distance).splice(0, 5));
	} catch (e) {
		res.sendStatus(500);
	}
});

app.get("/street", (req, res) => {
	res.send(streets.splice(0, 3).map((option => `${option.VIA_CLASE} ${option.VIA_PAR} ${option.VIA_NOMBRE}`)));
})
app.get("/street/:streetName", (req, res) => {
	let options = streets.filter(street => `${street.VIA_CLASE} ${street.VIA_NOMBRE}`.toLocaleLowerCase().includes(req.params.streetName.toLocaleLowerCase()) || `${street.VIA_CLASE} ${street.VIA_PAR} ${street.VIA_NOMBRE}`.toLocaleLowerCase().includes(req.params.streetName.toLocaleLowerCase()) || req.params.streetName.toLocaleLowerCase().includes(`${street.VIA_CLASE} ${street.VIA_NOMBRE}`.toLocaleLowerCase()) || req.params.streetName.toLocaleLowerCase().includes(`${street.VIA_CLASE} ${street.VIA_PAR} ${street.VIA_NOMBRE}`.toLocaleLowerCase()));
		let lastOption = options[options.length - 1];
		options = options.map((option => `${option.VIA_CLASE} ${option.VIA_PAR} ${option.VIA_NOMBRE}`));
		options.pop();
		if (lastOption) {
			let matches = 0;
			for (let i = Math.min(lastOption.PAR_MIN, lastOption.IMPAR_MIN); i <= Math.max(lastOption.PAR_MAX, lastOption.IMPAR_MAX); i++) {
				if (!req.params.streetName.match(/\d+/) || `${i}`.includes(req.params.streetName.match(/\d+/)[0])) {
					options.push(`${lastOption.VIA_CLASE} ${lastOption.VIA_PAR} ${lastOption.VIA_NOMBRE}, ${i}`);
					matches++;
				}
			}
		}
	res.send(options.splice(0, 3));
	
})






app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

