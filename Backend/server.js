import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

//dataBase
import connectDB from "./dbs/connect.js";

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
