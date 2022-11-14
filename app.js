const bcrypt = require("bcrypt");
const express = require("express");

const jwt = require("jsonwebtoken");
const auth = require("./auth");
const PORT = process.env.PORT || 3001;
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const moment = require('moment');

dotenv.config();

//middleware
app.use(bodyParser.urlencoded({ extended: false }));

const dbConnect = require("./server/db/dbConnect");
const User = require("./server/db/userModel");
const Appointment = require("./server/db/appointmentModel");
const Comprador = require("./server/db/compradorModel");
const Reserve = require("./server/db/reserveCoworkingModel");

const cors = require("cors");
//SDK Mercadopago
const mercadopago = require("mercadopago");
//Agrega credenciales
mercadopago.configure({
  access_token:
    "APP_USR-2126529931764627-100511-e11cd4721d495d955529b5a4d64e189a-1211400041",
});

// execute database connection
dbConnect();

app.use(express.json());
app.use(cors());

app.post("/mp_ipn", (req, res) =>{
  console.log("body", req.body);
  const topic = req.body.topic;
  console.log("topic:", topic);
  var merchantOrder;
  switch (topic){
    case "payment":
      const paymentId = req.body.id ;
      console.log(topic, 'getting payment' , paymentId);
      console.log(topic, 'getting marchant order');

      res.status(200).send();
      break;
    case "merchant_order":
      const orderId = req.body.id;
      console.log(topic, 'getting merchant order', orderId);
      merchantOrder = mercadopago.merchant_orders.findById(orderId);

      res.status(200).send();
      break;
  }

  
})

app.post("/test", (request, response) => {
  console.log(JSON.stringify(request.query));
  console.log(JSON.stringify(request.body));

  response.json(request.body);
});

app.delete("/coworking/:eventId", (request, response) => {
  let eventId = request.params.eventId;

  Appointment.deleteOne({ _id: eventId }, function (err, docs) {
    response.status(200).send(docs);
  });
});

app.post("/coworking", (request, response) => {
  const appointment = new Appointment({
    dateFrom: moment(request.body.dateFrom),
    dateTo: moment(request.body.dateTo),
    userId: request.body.userId,
    halfFrom: Number(request.body.halfFrom),
    halfTo: Number(request.body.halfTo),
    status: 'pending',
  });

  appointment
    .save()
    .then((result) => {

    })
    .catch((error) => {
      response.status(500).send({
        message: "Error saved date",
        error,
      });

      return;
    });
    
  let preference = {};
  preference.items = [];

  let dias = moment(appointment.dateFrom).diff(moment(appointment.dateTo), "days");
  dias = dias * -1;
  
  if(dias == 0)
    dias = 1;

  let price = 0;

  //Desde las 9 hasta las 18
  if(appointment.halfFrom == 1 && appointment.halfTo == 2)
    price = dias*800
  //Desde las 9 hasta las 13
  if(appointment.halfFrom == 1 && appointment.halfTo == 1)
    price = dias*400
  //Desde las 13 hasta las 18
  if(appointment.halfFrom == 2 && appointment.halfTo == 2)
    price = dias*400;

  preference.items.push({
    title: `Reserva para coworking (${dias})`,
    unit_price: price,
    quantity: 1,
  })

  preference.notification_url = 'https://jesters-website-back.vercel.app/mp_ipn?appointmentid=' + appointment._id;
  
  preference.payer = {
    name: "jorge",
    email: "email@gmail.com",
    identification: {
      type: "DNI",
      number: '12345678',
    },
  };

  mercadopago.preferences
    .create(preference)
    .then((res) => {
      let preferenceResponse = JSON.stringify(res.body.init_poin);
      console.log("Generando redireccion a MP", preferenceResponse);
      response.status(200).json({
          message: 'OK',
          result: appointment,
          mp_body: res.body,
        }
      );
    })
    .catch(function (error) {
      console.log("error 149");
      console.log(error);
    });
});
// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt.hash(request.body.password, 10).then((hashedPassword) => {
    // create a new user instance and collect the data
    const user = new User({
      email: request.body.email,
      password: hashedPassword,
      fullName: request.body.fullName,
      dateBirth: request.body.dateBirth,
      dni: request.body.dni,
    });
    // save the new user

    console.log("user: ", user);

    user
      .save()
      // return success if the new user is added to the database successfully
      .then((result) => {
        response.status(201).send({
          message: "User Created Successfully",
          result,
        });
      })
      // catch error if the new user wasn't added successfully to the database
      .catch((error) => {
        response.status(500).send({
          message: "Error creating user",
          error,
        });
      });
  });

});

app.get("/appointments/:id", (request, response) => {
  let userIdd = request.params.id;
  let documents = [];

  Appointment.find({ userId: userIdd }, function (err, docs) {
    response.status(200).send(docs);
  });
});

// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      if (user) {
        // console.log("body password: ",request.body.password);
        // console.log("user password: ",user.password);
        bcrypt
          .compare(request.body.password, user.password)

          // if the passwords match
          .then((passwordCheck) => {
            // console.log("passwordCheck: ", passwordCheck);
            // check if password matches
            if (!passwordCheck) {
              return response.status(400).send({
                message: "Passwords does not match",
                error: 402,
              });
            }

            // console.log("before token");
            //   create JWT token
            const token = jwt.sign(
              {
                userId: user._id,
                userEmail: user.email,
              },
              "RANDOM-TOKEN",
              { expiresIn: "24h" }
            );

            // console.log("after token: ",token);

            //   return success response
            response.status(200).send({
              message: "Login Successful",
              id: user._id,
              fullName: user.fullName,
              email: user.email,
              token,
            });
          });
      } else {
        response.status(400).send({
          message: "Passwords or user does not match",
          error,
        });
      }
      // compare the password entered and the hashed password found
      // catch error if password does not match
      // .catch((error) => {
      //   response.status(400).send({
      //     message: "Passwords does not match",
      //     error,
      //   });
      // });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});

app.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/news", (req, res) => {
  res.json({
    news: [
      {
        title: "Prueba1",
        body: "probandolala",
        author: "russ",
        image:
          "https://www.teamliquid.com/images/converted/2c8d4efaf6310b5903e53db6739c7fc10e4984bf.jpg",
      },
      {
        title: "Prueba2",
        body: "probandolala2",
        author: "russ2",
        image: "hola2",
      },
      {
        title: "Prueba3",
        body: "probandolala3",
        author: "russ3",
        image: "hola3",
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});