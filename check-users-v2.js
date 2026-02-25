import mongoose from "mongoose";

async function check() {
    await mongoose.connect("mongodb://localhost:27017/workforce");
    const User = mongoose.model("User", new mongoose.Schema({ email: String, profile: Object }));
    const users = await User.find({}, { email: 1, "profile.displayName": 1, "profile.employeeCode": 1 });
    console.log(users);
    await mongoose.disconnect();
}

check();
