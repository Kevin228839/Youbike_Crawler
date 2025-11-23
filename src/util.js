const { MongoClient } = require("mongodb");
const mongodbHost = process.env.MONGODB_HOST || "localhost";
const mongodbUrl = `mongodb://${mongodbHost}:27017`;

async function getData(ver, lng, lat) {
  const client = new MongoClient(mongodbUrl);
  try {
    // filter data from mongodb
    await client.connect();
    const database = client.db("demo");
    const youbike = database.collection("youbike");
    await youbike.createIndex({ location: "2dsphere" });
    const response = await youbike
      .aggregate([
        // 1. Find nearest documents (but may include outdated entries)
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            spherical: true,
            distanceField: "distance",
            maxDistance: 2000, // 2km
          },
        },

        // 2. Filter version only after geoNear
        { $match: { version: ver } },

        // 3. Sort by station + datetime (newest first for each station)
        { $sort: { station: 1, datatime: -1 } },

        // 4. Group to keep latest record for each station
        {
          $group: {
            _id: "$station",
            latest: { $first: "$$ROOT" },
          },
        },

        // 5. Clean document
        { $replaceRoot: { newRoot: "$latest" } },

        // 6. After grouping, sort by distance again
        { $sort: { distance: 1 } },

        // 7. Take the nearest 3 stations with latest data
        { $limit: 3 },
      ])
      .toArray();

    if (response.length === 0) {
      return "no station within 2km";
    }
    return response;
  } catch (error) {
    console.log(error);
    return { error: "internal server error" };
  } finally {
    await client.close();
  }
}

module.exports = {
  getData,
};
