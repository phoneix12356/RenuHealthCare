import { Schema, model } from "mongoose";

const overviewSchema = new Schema({
  overview: {
    type: String, // Changed from 'string' to 'String'
    required: true,
  },
  internshipType: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
  },
  duration: {
    type: Number,
    enum: [3, 6],
    default: 3, // Changed from 'defaule' to 'default'
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  projectDeadline: {
    type: Date,
    required: true,
  },
  procedure: [{
    type: String,
    required: true, // Changed from 'requried' to 'required'
  }],
}, { timestamps: true });

export default model("Overview", overviewSchema);