import mongoose, { Schema, Document } from "mongoose";

export interface IPestResult extends Document {
  image: string;
  pest: string;
  confidence: number;
  severity: string;
  treatment: string;
  advisory: string;
  createdAt: Date;
}

const PestResultSchema: Schema = new Schema({
  image: { type: String, required: true },
  pest: { type: String, required: true },
  confidence: { type: Number, required: true },
  severity: { type: String, required: true },
  treatment: { type: String, required: true },
  advisory: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPestResult>("PestResult", PestResultSchema);
