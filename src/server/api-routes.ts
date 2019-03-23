import * as express from 'express';
import { TrapezeApiClient, VehicleStorage } from '@donmahallem/trapeze-api-client';
import { getStations, getVehicleLocations, getTripPassages, getStopDepartures, getRouteByVehicleId, getRouteByTripId, getStopDepartures2, getStopDepartures3 } from "./";
const app: express.Router = express.Router();

const trapezeApi: TrapezeApiClient = new TrapezeApiClient('https://kvg-kiel.de/');
const str: VehicleStorage = new VehicleStorage(trapezeApi, 30000);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/api/geo/stations', function (req, res) {
    getStations()
        .then((data_res) => {
            res.json(data_res)
        }).catch((err) => {
            res.status(500).send("error");
        })
});
app.get('/api/geo/vehicles', function (req, res) {
    console.log("Queried", req.query.left, req.query.right, req.query.top, req.query.bottom);
    if (!isNaN(req.query.left) && !isNaN(req.query.left) && !isNaN(req.query.left) && !isNaN(req.query.left)) {
        str.getVehicles(req.query.left,
            req.query.right,
            req.query.top,
            req.query.bottom)
            .then(data_res => {
                res.json({ vehicles: data_res });
            }).catch((err) => {
                res.status(500)
                    .send("error");
            })
    } else {
        getVehicleLocations()
            .then((data_res) => {
                res.json(data_res)
            }).catch((err) => {
                res.status(500)
                    .send("error");
            })
    }
});

app.get('/api/trip/:id/passages', function (req, res) {
    Promise.all([getTripPassages(req.params.id, req.query.mode), str.getVehicleByTripId(req.params.id)])
        .then((result) => {/*
            const resp = {
                passages: result[0],
                location: result[1],
                tripId: req.params.id
            }*/
            const resp = result[0];
            resp.location = result[1];
            resp.tripId = req.params.id;
            res.json(resp);
        })
        .catch((err) => {
            if (err == null) {
                res.status(404).send("not found");
            } else {
                res.status(500).send("err");
            }
        })
});

app.get('/api/vehicle/:id/route', function (req, res) {
    getRouteByVehicleId(req.params.id)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("err");
        })
});
app.get('/api/trip/:id/route', function (req, res) {
    getRouteByTripId(req.params.id)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.error(err.status);
            res.status(500).send("err");
        })
});
app.get('/api/stop/:id/departures', function (req, res) {
    getStopDepartures(req.params.id)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("err");
        })
});
app.get('/api/stop/:id/info', function (req, res) {
    getStopDepartures2(req.params.id)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("err");
        })
});
app.get('/api/stopPoint/:id/info', function (req, res) {
    getStopDepartures3(req.params.id)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("err");
        })
});
app.get('/api/geo/vehicle/:id', function (req, res) {
    str.getVehicle(req.params.id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            if (err == null) {
                res.status(404).send("not found");
            } else {
                res.status(500).send("err");
            }
        })
});
//app.use(express.static(__dirname + '/app/index.html'));
app.use(express.static(__dirname + '/../app'));
app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/../app/index.html');
})
module.exports = app;