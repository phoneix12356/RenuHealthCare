import { Schema, model } from "mongoose";

const overviewSchema = new Schema({
  departmentName:{
    type:String,
    required:true
  },
  overview: {
    type: String, // Changed from 'string' to 'String'
    required: true,
  },
  duration: {
    type: Number,
    enum: [3, 6],
    default: 3, // Changed from 'defaule' to 'default'
    required: true,
  },
  rules: [{
    type: String,
    required: true, // Changed from 'requried' to 'required'
  }],
}, { timestamps: true });

export default model("Overview", overviewSchema);