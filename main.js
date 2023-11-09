const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 

app.use(express.json());

mongoose.connect('mongodb://localhost/assign8', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB Error: ' + error);
});

db.once('open', () => {
  console.log('Connected to assign8 db');

  const userSchema = new mongoose.Schema({
      name: {
          type: String,
          required: true,
          minlength: 4, 
      },
      email: {
          type: String,
          required: true,
          unique: true, 
          validate: {
              validator: (value) => {
                  
                  return /.@northeastern.edu$/.test(value);
              },
              message: "Email must be from northeastern.edu domain"
          }
      },
      password: {
          type: String,
          required: true,
          minlength: 6,
      },
  });

  userSchema.pre("save", async function(next) {
      if (!this.isModified("password")) return next();

      try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(this.password, salt);
          this.password = hashedPassword;
          next();
      } catch (error) {
          return next(error);
      }
  });

  const UserModel = mongoose.model("test1", userSchema);

  function validateNameAndEmail(name, email, password) {
    if (name && name.length < 4) {
        return "Name should have a minimum of 4 characters";
    }

    if (!/^[a-zA-Z0-9._%+-]+@northeastern\.edu$/.test(email)) {
        return "Email must be from northeastern.edu domain";
    }

    if (password && password.length < 6) {
        return "Password should have a minimum length of 6 characters";
    }

    return null; 
}

app.post("/user/create", async (req, res) => {
    const { name, email, password } = req.body;
    const nameAndEmailValidation = validateNameAndEmail(name, email, password);

    if (nameAndEmailValidation) {
        return res.status(400).json({ error: nameAndEmailValidation });
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
    }

    const data = new UserModel({
        name,
        email,
        password,
    });

    try {
        const val = await data.save();
        res.json("User Created !");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const monmodel = mongoose.model("test1", userSchema);

app.put("/user/edit", async (req, res) => {
    const { email, name, password } = req.body;
    const nameAndEmailValidation = validateNameAndEmail(name, email, password);

    if (nameAndEmailValidation) {
        return res.status(400).json({ error: nameAndEmailValidation });
    }

    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
    }

    existingUser.name = name;
    existingUser.password = password;

    const updatedUser = await existingUser.save();
    
    res.json("User Details Updated !");
});

app.delete("/user/delete", async (req, res) => {
    try {
        const { email } = req.body;

        const deletedUser = await monmodel.findOneAndDelete({ email });

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/user/getAll", async (req, res) => {
    try {
        const test1 = await monmodel.find({}, { _id: 0, name: 1, email: 1, password: 1 });

        res.json(test1);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(1024, () => {
    console.log("Server is listening on port 1024");
})});
