const axios = require("axios");
const { Router } = require("express");


const router = Router();


router.use((req, res, next) => {
    axios.all([
         axios.get('https://recruiting-api.newshore.es/api/flights/0'),
         axios.get('https://recruiting-api.newshore.es/api/flights/1'),
         axios.get('https://recruiting-api.newshore.es/api/flights/2')
     ])
         .then(axios.spread((response1, response2, response3) => {
             const data = [response1.data, response2.data, response3.data].flat();
             req.newData = data.map(d => {
                 const { departureStation, arrivalStation, flightCarrier, flightNumber, price } = d;
                 return {
                     Journey: {
                         Origin: departureStation,
                         Destination: arrivalStation,
                         Price: price,
                         Flights: [
                             {
                                 Origin: departureStation,
                                 Destination: arrivalStation,
                                 Price: price,
                                 Transport: {
                                     FlightCarrier: flightCarrier,
                                     FlightNumber: flightNumber
                                 }
                             }
                         ]
                     }
                 }
             });
             next();
             
         }))
         .catch((err) => console.log(err));
 });
 
 router.get('/viajes', (req, res) => {
     
     const origin = req.query.origin;
     const destination = req.query.destination;
     let journey = null;
     
     
     req.newData.forEach(j => {
       if (j.Journey.Origin === origin && j.Journey.Destination === destination) {
           journey = j;
       }
     });
     if (journey) {
         res.json(journey);
         
     
    } else {
      res.status(404).send("No se encontró una relación entre el origen y el destino especificado.");
    }
  });
  
  
  
  
  










module.exports = router;
