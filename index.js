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

    //GET API
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    //POST API
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.json(result);
    });

    //UPDATE API
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const updatedService = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          name: updatedService.name,
          desc: updatedService.desc,
          price: updatedService.price,
          status: updatedService.status,
        },
      };
      const result = await servicesCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //DELETE API
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);

      // console.log(("deleting service with id", result));
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running my CRUD server");
});

app.listen(port, () => {
  console.log("Running server on port", port);
});
