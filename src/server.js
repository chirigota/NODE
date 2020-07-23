const express = require('express');
const fetch = require("node-fetch");
const cors = require("cors");
const fs = require("fs");
const app = express();
const data = require("./data.json");
const streets = require("./streets.json");
const port = 3001;
//TOREMOVE

setInterval(() => {
	fetch("https://spotashop.herokuapp.com/").then(d => console.log("Called"))
}, 27 * 60 * 1000)

function getData() {
	fetch("https://spotashop.herokuapp.com/get_ids").then(d => d.json()).then(ids => {
		fs.writeFile("src/data2.json", "[", () => { });
		for (let i in ids) {
			fetch(`https://spotashop.herokuapp.com/get_place/id/${ids[i]}`).then(place => place.json()).then(place => {
				fs.readFile("src/data2.json", "utf-8", (e, d) => fs.writeFile("src/data2.json", d + JSON.stringify(place[0]) + ",\n", () => { }));
			})
		}
		fs.readFile("src/data2.json", "utf-8", (e, d) => fs.writeFile("src/data2.json", d + "]", () => { }));
	}
	)
}

app.use(cors());
app.get('/', (req, res) => {
	res.send('Hello World!');
	console.log("hola mundo");
});
app.get("/getStore/:id", async (req, res) => {
	let place = data.filter(place => place.place_id == req.params.id);
	if (place) {
		place[0].occupation = Math.random() * 100;
	}
	res.send(place ? place[0] : {})
})
app.get("/getStores/:lat/:lon/:category", (req, res) => {
	try {
		// let data = await fetch("https://spotashop.herokuapp.com/get_ids");
		let coords = data.filter(place => place.type === req.params.category).map(place => {
			return { ...place, "distance": Math.pow(place.lat - req.params.lat, 2) + Math.pow(place.lng - req.params.lon, 2) };
		});
		if (coords) {
			for (let i in coords)
				coords[i].occupation = Math.random() * 100;
		}
		res.send(coords.sort((a, b) => a.distance - b.distance).splice(0, 5));
	} catch (e) {
		res.sendStatus(500);
	}
});

app.get("/street", (req, res) => {
	res.send(streets.splice(0, 3).map((option => `${option.VIA_CLASE} ${option.VIA_PAR} ${option.VIA_NOMBRE}`)));
})
app.get("/street/:streetName", (req, res) => {
	req.params.streetName = req.params.streetName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
	let options = streets.filter(street => `${street.VIA_NOMBRE}`.toLowerCase().includes(req.params.streetName.toLowerCase()) || `${street.VIA_CLASE} ${street.VIA_NOMBRE}`.toLowerCase().includes(req.params.streetName.toLowerCase()) || `${street.VIA_CLASE} ${street.VIA_PAR} ${street.VIA_NOMBRE}`.toLowerCase().includes(req.params.streetName.toLowerCase()) || req.params.streetName.toLowerCase().includes(`${street.VIA_CLASE} ${street.VIA_NOMBRE}`.toLowerCase()) || req.params.streetName.toLowerCase().includes(`${street.VIA_CLASE} ${street.VIA_PAR} ${street.VIA_NOMBRE}`.toLowerCase()) || req.params.streetName.toLowerCase().includes(`${street.VIA_NOMBRE}`.toLowerCase()));
	let lastOption = options[options.length - 1];
	options = options.map((option => `${option.VIA_CLASE} ${option.VIA_PAR} ${option.VIA_NOMBRE}`));
	options.pop();
	if (lastOption) {
		let matches = 0;
		for (let i = Math.min(lastOption.PAR_MIN, lastOption.IMPAR_MIN); i <= Math.max(lastOption.PAR_MAX, lastOption.IMPAR_MAX); i++) {
			if (!req.params.streetName.match(/\d+/) || `${i}`.includes(req.params.streetName.match(/\d+/)[0])) {
				options.push(`${lastOption.VIA_CLASE} ${lastOption.VIA_PAR} ${lastOption.VIA_NOMBRE_ACENTOS}, ${i}`);
				matches++;
			}
		}
	}
	res.send(options.splice(0, 3));
})






app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

