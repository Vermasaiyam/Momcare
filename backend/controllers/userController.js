import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';
import medicineModel from "../models/medicineModel.js";

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender, isPregnant, age, currentMonth, expectedDeliveryDate, complications } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.status(400).json({ success: false, message: "Data Missing" });
        }

        // Ensure age and currentMonth are numbers or null
        const parsedAge = age && !isNaN(age) ? parseInt(age) : null;
        const parsedCurrentMonth = currentMonth && !isNaN(currentMonth) ? parseInt(currentMonth) : null;

        const updateFields = {
            name,
            phone,
            address: address ? JSON.parse(address) : {},
            dob,
            gender,
            pregnancyDetails: {
                isPregnant: isPregnant === 'true', // Convert to boolean
                age: parsedAge,
                currentMonth: parsedCurrentMonth,
                expectedDeliveryDate: expectedDeliveryDate || null,
                complications: complications || "None",
            }
        };

        if (imageFile) {
            updateFields.image = imageFile.path;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

const addToCart = async (req, res) => {
    try {
        const { userId, medicineId } = req.body;

        if (!userId || !medicineId) {
            return res.status(400).json({ error: "User ID and Medicine ID are required" });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const medicine = await medicineModel.findById(medicineId);
        if (!medicine) return res.status(404).json({ error: "Medicine not found" });

        if (user.cart.includes(medicineId)) {
            return res.status(400).json({ error: "Medicine already in cart" });
        }

        user.cart.push(medicineId);
        await user.save();

        res.status(200).json({ message: "Medicine added to cart", cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const getCartItems = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await userModel.findById(userId).populate("cart");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user.cart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Remove an item from the cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, medicineId } = req.params;

        if (!userId || !medicineId) {
            return res.status(400).json({ error: "User ID and Medicine ID are required" });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.cart.includes(medicineId)) {
            return res.status(400).json({ error: "Medicine not found in cart" });
        }

        user.cart = user.cart.filter((id) => id.toString() !== medicineId);
        await user.save();

        res.status(200).json({ message: "Medicine removed from cart", cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const saveChat = async (req, res) => {
    const { user_id, userQuestion, aiResponse } = req.body;

    if (!user_id || !userQuestion || !aiResponse) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await userModel.updateOne(
            { _id: user_id },
            { $push: { chat: { userQuestion, aiResponse } } }
        );

        if (result.modifiedCount === 0) {
            console.error("No user found with this ID:", user_id);
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Chat saved successfully" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
};

const chatHistory = async (req, res) => {
    try {
        const { user_id } = req.params;


        // Find user chat history
        const user = await userModel.findById(user_id, "chat");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ chatHistory: user.chat });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    addToCart,
    getCartItems,
    removeFromCart,
    saveChat,
    chatHistory,
}