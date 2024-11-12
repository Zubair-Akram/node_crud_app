import express from "express";
import multer from "multer";
import User from '../models/users.js';
import fs from "fs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({
    storage: storage,
}).single("image");

// POST route for adding a user
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename, // Use `req.file.filename` to access the uploaded file's name
        });

        await user.save(); // Save the user without a callback
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Home page route with async/await
router.get("/", async (req, res) => {
    try {
        const users = await User.find(); // Await User.find() without exec() or callback
        res.render("index", {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Route for rendering the Add User page
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});


// router for edit user page
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect("/");
        }

        res.render("edit_user", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

//update user route 

router.post("/update/:id", upload, async (req, res) => {
    const id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        
        // Try to delete the old image if it exists
        try {
            if (req.body.old_image && req.body.old_image !== new_image) {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            }
        } catch (err) {
            console.log("Error deleting old image:", err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (result) {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully!',
            };
            res.redirect("/");
        } else {
            res.json({ message: "User not found", type: 'danger' });
        }
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});
  
//user delete router
router.get("/delete/:id", async (req, res) => {
    const id = req.params.id;
    
    try {
        const result = await User.findByIdAndDelete(id);

        if (result && result.image) {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log("Error deleting image:", err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!'
        };
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting user:", err);
        res.json({ message: err.message });
    }
});


export default router;
