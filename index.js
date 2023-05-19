const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s92qhby.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const shopByCategoryCollection = client
      .db("toyGalaxyDB")
      .collection("toyGalaxyCategory");

    const allToysDetailsCollection = client
      .db("toyGalaxyDB")
      .collection("allToysDetails");

    const indexKeys = { name: 1 };
    const indexOptions = { name: "name" };
    const result = await allToysDetailsCollection.createIndex(
      indexKeys,
      indexOptions
    );

    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await allToysDetailsCollection
        .find({
          $or: [{ name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.get("/toyGalaxyCategory", async (req, res) => {
      const result = await shopByCategoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/toyGalaxyCategory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await shopByCategoryCollection.findOne(query);
      res.send(result);
    });

    app.get("/allToysDetails", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {
          sellerEmail: req.query.email,
        };
      }
      const result = await allToysDetailsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allToysDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToysDetailsCollection.findOne(query);
      res.send(result);
    });

    app.post("/allToysDetails", async (req, res) => {
      const toyDetails = req.body;
      console.log(toyDetails);
      const result = await allToysDetailsCollection.insertOne(toyDetails);
      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      const toy = {
        $set: {
          price: updatedToy.price,
          availableQuantity: updatedToy.availableQuantity,
          description: updatedToy.description,
        },
      };
      const result = await allToysDetailsCollection.updateOne(filter, toy);
      res.send(result);
    });

    app.delete("/allToysDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToysDetailsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Galaxy is spinning");
});

app.listen(port, () => {
  console.log(`Toy Galaxy listening on port: ${port}`);
});
