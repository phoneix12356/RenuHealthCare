import { Schema, Model, model } from "mongoose";

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    taskId:{
      type:Schema.Types.ObjectId, ref:"Task"
    },
    projectOverviewId:{
      type: Schema.Types.ObjectId, ref:"overview"
    }
  },
  { timestamps: true }
);

export default model("department",departmentSchema);