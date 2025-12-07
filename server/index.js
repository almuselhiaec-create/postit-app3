import bcrypt from "bcrypt";
import UserModel from "./Models/UserModel.js";
import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import PostModel from "./Models/Posts.js";


const app = express();
app.use(express.json());
app.use(cors());

// ✅ Database connection
const connectString =
  "mongodb+srv://admin:admin123@postitcluster.t8dzf6q.mongodb.net/postITDb?appName=PostITCluster";

mongoose
  .connect(connectString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ REGISTER
app.post("/registerUser", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ user, msg: "User registered successfully." });
  } catch (error) {
    console.error("❌ Register error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while registering user." });
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // login success
    res.status(200).json({ user, msg: "Login successful!" });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "An error occurred while logging in." });
  }
});

// ✅ LOGOUT
app.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully." });
});

app.post("/savePost", async (req, res) => {
  try {
    const postMsg = req.body.postMsg;
    const email = req.body.email;

    const post = new PostModel({
      postMsg: postMsg,
      email: email,
    });

    await post.save();
    res.send({ post: post, msg: "Added." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/getPosts", async (req, res) => {
  try {
    // Fetch all posts from the "PostModel" collection, sorted by createdAt in descending order
    const posts = await PostModel.find({}).sort({ createdAt: -1 });

    const countPost = await PostModel.countDocuments({});

    res.send({ posts: posts, count: countPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.put("/updateUserProfile/:email/", async (req, res) => {
  //Retrieve the value from the route
  const email = req.params.email;
  //Retrieve the values from the request body.
  const name = req.body.name;
  const password = req.body.password;

  try {
    // Search for the user that will be updated using the findOne method
    const userToUpdate = await UserModel.findOne({ email: email });

    // Check if the user was found
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's name
    userToUpdate.name = name;

    //if the user changed the password, change the password in the Db to the new hashed password
    if (password !== userToUpdate.password) {
      const hashedpassword = await bcrypt.hash(password, 10);
      userToUpdate.password = hashedpassword;
    } else {
      //if the user did not change the password
      userToUpdate.password = password;
    }

    // Save the updated user
    await userToUpdate.save(); // Make sure to save the changes

    // Return the updated user as a response
    res.send({ user: userToUpdate, msg: "Updated." });
  } catch (error) {
    // Handle errors, including database or validation issues
    res.status(500).json({ error: error.message }); // Send a more descriptive error message optional
  }
});












// ✅ Start server
app.listen(3002, () => {
  console.log("🚀 Server running on port 3002");
});
