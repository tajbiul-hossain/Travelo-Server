const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l19vq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travelo");
    const servicesCollection = database.collection("services");
    const bookingsCollection = database.collection("bookings");

    //GET API
    app.get("/packages", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    app.get("/userbookings/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = bookingsCollection.find({});
      const bookings = await cursor.toArray();
      res.send(bookings.filter((booking) => booking.userEmail === email));
    });

    app.get("/managebookings", async (req, res) => {
      const cursor = bookingsCollection.find({});
      const bookings = await cursor.toArray();
      res.send(bookings);
    });

    //POST API

    //add new package
    app.post("/package", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.json(result);
    });

    //add a booking
    app.post("/booking", async (req, res) => {
      const newService = req.body;
      const result = await bookingsCollection.insertOne(newService);
      res.json(result);
    });

    //UPDATE API
    app.put("/managebookings/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBooking = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      const result = await bookingsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //DELETE API
    app.delete("/package/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travelo server is Running");
});

app.listen(port, () => {
  console.log("Running server on port", port);
});
