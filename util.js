const { MongoClient } = require("mongodb");

async function read(ver, lng, lat) {
  // Connection URI
  const uri =
  "mongodb://localhost:2717,localhost:2727,localhost:2737/?replicaSet=myReplicaSet&readPreference=secondary";
  // Create a new MongoClient
  const client = new MongoClient(uri);

  try {
    // Connect the client to the server
    await client.connect();

    // read data from mongodb
    console.log("Connected successfully to server, start reading data");
    const database = client.db("demo");
    const youbike = database.collection("youbike");
    await youbike.createIndex( { location: "2dsphere" } );
    const res = await youbike.aggregate( [
      {
         $geoNear: {
            near: { type: "Point", coordinates: [ lng, lat ] },
            spherical: true,
            maxDistance: 2000,
            query: { version: ver },
            distanceField: "calcDistance"
         }
      }, { $limit: 5 }
    ] );
    const response = await res.toArray();
    const mode = res.readPreference.mode;
    if(response.length === 0) {
      await client.close();
      return {data: 'no station within 2km', 'read mode': mode};
    }
    const station = response[0].station;
    const closestStation = await youbike.find({station:station, version: ver}).sort({datatime: -1});
    const result = await closestStation.toArray();
    await client.close();
    return {"data": result[0], "read mode": mode};

  } catch(error) {
    await client.close();
    console.log(error);
    return;
  } 
}

module.exports = {
  read,
}