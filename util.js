const { MongoClient } = require("mongodb");
const mongodbHost = process.env.MONGODB_HOST || "localhost";
const mongodbUrl = `mongodb://${mongodbHost}:27017`;

async function getData(ver, lng, lat) {
  // Create a new MongoClient
  const client = new MongoClient(mongodbUrl);

  try {
    // Connect the client to the server
    await client.connect();

    // read data from mongodb
    const database = client.db("demo");
    const youbike = database.collection("youbike");
    await youbike.createIndex({ location: "2dsphere" });
    let response = await youbike
      .aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            spherical: true,
            maxDistance: 2000,
            query: { version: ver },
            distanceField: "calcDistance",
          },
        },
        { $limit: 5 },
      ])
      .toArray();
    if (response.length === 0) {
      return { data: "no station within 2km" };
    }
    const station = response[0].station;
    response = await youbike
      .find({ station: station, version: ver })
      .sort({ datatime: -1 })
      .toArray();
    return { data: response[0] };
  } catch (error) {
    console.log(error);
    return;
  } finally {
    await client.close();
  }
}

module.exports = {
  getData,
};
