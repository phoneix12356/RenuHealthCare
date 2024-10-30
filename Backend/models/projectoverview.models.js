import { Schema, Mongoose } from "mongoose";
const overviewSchema = new Schema(
  {
    overview: {
      type: string,
      requried: true,
    },
    internshipType: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    duration: {
      type: Number,
      enum: [3, 6],
      defaule: 3,
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    projectDeadline: { type: Date, required: true },
    procedure: [{ type: String, requried: true }],
  },
  { timestamps: true }
);

export default model("overview", overviewSchema);
