import mongoose from "mongoose";

async function check() {
    await mongoose.connect("mongodb://localhost:27017/workforce");
    const User = mongoose.model("User", new mongoose.Schema({ email: String, profile: Object }));
    const users = await User.find({});
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
}

check();
