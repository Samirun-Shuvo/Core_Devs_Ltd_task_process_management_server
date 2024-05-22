const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://samirunshuvo:zBhwLoqQ4soluxu5@cluster11.iypphi5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster11";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const userCollection = client.db("anlima_admin").collection("users");
    const processCollection = client.db("anlima_admin").collection("process");

    app.get("/user", async (req, res) => {
      try {
        const result = await userCollection.find({}).toArray();
        res.send({ status: "success", result });
      } catch (error) {
        console.error("Error fetching users", error);
        res
          .status(500)
          .send({ status: "error", message: "Internal Server Error" });
      }
    });

    app.get("/allprocess", async (req, res) => {
      try {
        const query = {};
        const result = await processCollection.find(query).toArray();
        res.send({ status: "success", result });
      } catch (error) {
        console.error("Error creating process", error);
        res
          .status(500)
          .send({ status: "error", message: "Internal Server Error" });
      }
    });

    app.delete("/allprocess/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await processCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          const query = {};
          const result = await processCollection.find(query).toArray();
          res.send({
            status: "success",
            message: "Process deleted successfully",
            result,
          });
        } else {
          res
            .status(404)
            .send({ status: "error", message: "Process not found" });
        }
      } catch (error) {
        console.error("Error deleting process", error);
        res
          .status(500)
          .send({ status: "error", message: "Internal Server Error" });
      }
    });

    app.put("/allprocess/:id", async (req, res) => {
        try {
          const id = req.params.id;
          const updatedProcess = req.body;
          const query = { _id: new ObjectId(id) };
          const update = {
            $set: {
              name: updatedProcess.name,
              currentTime: new Date(updatedProcess.currentTime),
            },
          };
      
          const result = await processCollection.updateOne(query, update);
      
          if (result.modifiedCount === 1) {
            const updatedProcesses = await processCollection.find({}).toArray();
            res.send({
              status: "success",
              message: "Process updated successfully",
              result: updatedProcesses,
            });
          } else {
            res.status(404).send({ status: "error", message: "Process not found" });
          }
        } catch (error) {
          console.error("Error updating process", error);
          res.status(500).send({ status: "error", message: "Internal Server Error" });
        }
      });

    app.post("/createprocess", async (req, res) => {
      try {
        const newProcess = req.body;
        const result = await processCollection.insertOne(newProcess);
        res.send({ status: "success", result, data: newProcess });
      } catch (error) {
        console.error("Error creating process", error);
        res
          .status(500)
          .send({ status: "error", message: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Process Management Server is running");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
